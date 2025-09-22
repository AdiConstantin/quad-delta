using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

var allowLocal = "_allowLocal";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowLocal, policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors(allowLocal);

string connStr = Environment.GetEnvironmentVariable("DB_CONN")
  ?? "Server=localhost,1433;Database=appdb;User Id=sa;Password=StrongPassword!123;TrustServerCertificate=True;";

IDbConnection OpenConn()
{
    var c = new SqlConnection(connStr);
    c.Open();
    return c;
}

app.MapGet("/api/health", () => Results.Ok(new { ok = true, api = "dotnet", db = "mssql" }));

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
});

app.MapGet("/api/products", async () =>
{
    using var con = OpenConn();
    var rows = await con.QueryAsync<Product>("SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products ORDER BY Id");
    return Results.Ok(rows);
});

app.MapGet("/api/products/{id:int}", async (int id) =>
{
    using var con = OpenConn();
    var row = await con.QuerySingleOrDefaultAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products WHERE Id=@id", new { id });
    return row is null ? Results.NotFound() : Results.Ok(row);
});

app.MapPost("/api/products", async (ProductCreate body) =>
{
    using var con = OpenConn();
    var id = await con.ExecuteScalarAsync<int>(
        "INSERT INTO dbo.Products (Sku,Name,Price,IsActive) OUTPUT INSERTED.Id VALUES (@Sku,@Name,@Price,1);",
        body);
    var created = await con.QuerySingleAsync<Product>(
        "SELECT Id, Sku, Name, Price, IsActive, CreatedAt, UpdatedAt FROM dbo.Products WHERE Id=@id", new { id });
    return Results.Created($"/api/products/{id}", created);
});

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
});

app.MapDelete("/api/products/{id:int}", async (int id) =>
{
    using var con = OpenConn();
    var rows = await con.ExecuteAsync("DELETE FROM dbo.Products WHERE Id=@id;", new { id });
    return rows == 0 ? Results.NotFound() : Results.NoContent();
});

app.Run();

record Product(int Id, string Sku, string Name, decimal Price, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt);
record ProductCreate(string Sku, string Name, decimal Price);
record ProductUpdate(string Sku, string Name, decimal Price, bool IsActive);
