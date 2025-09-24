using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;
using System.Data;
using Microsoft.AspNetCore.OpenApi;
using System.Reflection; // add near top

var builder = WebApplication.CreateBuilder(args);

// Swagger & OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Quad Delta API",
        Version = "v1",
        Description = "Minimal API for products and audit logging.",
    });
    // Include XML comments if generated
    var xml = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xml);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
});

var allowLocal = "_allowLocal";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowLocal, policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Dev: easiest to iterate and avoids random-port issues observed in logs
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // Prod: add the ports you actually use (based on your logs)
            policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:5173",
                    "http://localhost:5000",
                    "http://localhost:5001",
                    "http://localhost:8080"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

// Swagger middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quad Delta API v1");
});
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors(allowLocal);

string connStr = Environment.GetEnvironmentVariable("DB_CONN")
  ?? "Server=localhost,1433;Database=appdb;User Id=sa;Password=StrongPassword!123;TrustServerCertificate=True;";

IDbConnection OpenConn()
{
    var c = new SqlConnection(connStr);
    c.Open();
    return c;
}

// Health
app.MapGet("/api/health", () =>
    Results.Ok(new { ok = true, api = "dotnet", db = "mssql" }))
    .WithName("GetHealth")
    .WithTags("Health")
    .WithOpenApi(op =>
    {
        op.Summary = "API health check.";
        op.Description = "Returns a simple indicator that the API service is reachable.";
        return op;
    })
    .Produces(StatusCodes.Status200OK);

// DB ping
app.MapGet("/api/db/ping", async () =>
{
    try
    {
        using var con = OpenConn();
        var now = await con.ExecuteScalarAsync<DateTime>("SELECT SYSUTCDATETIME()");
        return Results.Ok(new { ok = true, now });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
})
.WithName("PingDatabase")
.WithTags("Health")
.WithOpenApi(op =>
{
    op.Summary = "Checks database connectivity.";
    op.Description = "Executes a lightweight query to verify the SQL Server connection and returns current UTC time.";
    return op;
})
.Produces(StatusCodes.Status200OK)
.ProducesProblem(StatusCodes.Status500InternalServerError);

// List products
app.MapGet("/api/products", async () =>
{
    using var con = OpenConn();
    var rows = await con.QueryAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products ORDER BY Id");
    return Results.Ok(rows);
})
.WithName("ListProducts")
.WithTags("Products")
.WithOpenApi(op =>
{
    op.Summary = "Lists products.";
    op.Description = "Returns all products ordered by Id.";
    return op;
})
.Produces<IEnumerable<Product>>(StatusCodes.Status200OK);

// Get product by Id
app.MapGet("/api/products/{id:int}", async (int id) =>
{
    using var con = OpenConn();
    var row = await con.QuerySingleOrDefaultAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products WHERE Id=@id", new { id });
    return row is null ? Results.NotFound() : Results.Ok(row);
})
.WithName("GetProductById")
.WithTags("Products")
.WithOpenApi(op =>
{
    op.Summary = "Gets a product by Id.";
    op.Description = "Returns a single product or 404 if it does not exist.";
    return op;
})
.Produces<Product>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// Create product (fixed: avoid OUTPUT without INTO when triggers exist)
app.MapPost("/api/products", async (ProductCreate body) =>
{
    using var con = OpenConn(); 
    var id = await con.ExecuteScalarAsync<int>(@"
        INSERT INTO dbo.Products (Sku,Name,Price,IsActive)
        VALUES (@Sku,@Name,@Price,1);
        SELECT CAST(SCOPE_IDENTITY() AS int);", body);

    var created = await con.QuerySingleAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products WHERE Id=@id", new { id });
    return Results.Created($"/api/products/{id}", created);
})
.WithName("CreateProduct")
.WithTags("Products")
.WithOpenApi(op =>
{
    op.Summary = "Creates a new product.";
    op.Description = "Inserts a product with active status. Returns the created entity.";
    return op;
})
.Produces<Product>(StatusCodes.Status201Created);

// Update product
app.MapPut("/api/products/{id:int}", async (int id, ProductUpdate body) =>
{
    using var con = OpenConn();
    var rows = await con.ExecuteAsync(
        "UPDATE dbo.Products SET Sku=@Sku, Name=@Name, Price=@Price, IsActive=@IsActive WHERE Id=@Id;",
        new { Id = id, body.Sku, body.Name, body.Price, body.IsActive });
    if (rows == 0) return Results.NotFound();
    var updated = await con.QuerySingleAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products WHERE Id=@id", new { id });
    return Results.Ok(updated);
})
.WithName("UpdateProduct")
.WithTags("Products")
.WithOpenApi(op =>
{
    op.Summary = "Updates an existing product.";
    op.Description = "Modifies fields of an existing product. Returns 404 if it does not exist.";
    return op;
})
.Produces<Product>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// Delete product
app.MapDelete("/api/products/{id:int}", async (int id) =>
{
    using var con = OpenConn();
    var rows = await con.ExecuteAsync("DELETE FROM dbo.Products WHERE Id=@id;", new { id });
    return rows == 0 ? Results.NotFound() : Results.NoContent();
})
.WithName("DeleteProduct")
.WithTags("Products")
.WithOpenApi(op =>
{
    op.Summary = "Deletes a product.";
    op.Description = "Deletes a product by Id. Returns 204 when deleted, 404 if not found.";
    return op;
})
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

// Audit log
app.MapGet("/api/audit", async (HttpRequest req) =>
{
    string? table = req.Query["table"];
    int take = int.TryParse(req.Query["take"], out var t) ? Math.Clamp(t, 1, 500) : 100;

    var sql = @"
        SELECT TOP (@take) Id, TableName, Action, RowData, ChangedAt, ChangedBy
        FROM dbo.AuditLog
        WHERE (@table IS NULL OR TableName = @table)
        ORDER BY Id DESC";

    using var con = OpenConn();
    var rows = await con.QueryAsync(sql, new { take, table });
    return Results.Ok(rows);
})
.WithName("GetAuditLog")
.WithTags("Audit")
.WithOpenApi(op =>
{
    op.Summary = "Retrieves audit entries.";
    op.Description = "Returns recent audit log entries filtered optionally by table name. Limit default = 100, max = 500.";
    return op;
})
.Produces<IEnumerable<object>>(StatusCodes.Status200OK);

// Version info
app.MapGet("/api/version", () =>
{
    var asm = typeof(Program).Assembly;
    var informational = asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
    var fileVer = asm.GetCustomAttribute<AssemblyFileVersionAttribute>()?.Version;
    return Results.Ok(new
    {
        informationalVersion = informational,
        fileVersion = fileVer,
        env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
        gitSha = Environment.GetEnvironmentVariable("GIT_SHA"),
        appVersion = Environment.GetEnvironmentVariable("APP_VERSION")
    });
})
.WithName("GetVersion")
.WithTags("System")
.WithOpenApi(op =>
{
    op.Summary = "Returns build / version metadata.";
    op.Description = "Helps verify the container is running the expected build.";
    return op;
});

app.Run();

/// <summary>
/// Product DTO representing a stored product entity.
/// </summary>
record Product(int Id, string Sku, string Name, decimal Price, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt);

/// <summary>
/// Payload for product creation.
/// </summary>
record ProductCreate(string Sku, string Name, decimal Price);

/// <summary>
/// Payload for product update.
/// </summary>
record ProductUpdate(string Sku, string Name, decimal Price, bool IsActive);
