FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Accept build arguments for versioning
ARG BUILD_VERSION=dev
ARG GIT_SHA=local

COPY DbShowcase.Api.csproj ./
RUN dotnet restore

COPY . .
# Pass Git SHA into build via property (optional) or rely on InformationalVersion in csproj
RUN dotnet publish -c Release -o /app \
    /p:InformationalVersion=${BUILD_VERSION}+${GIT_SHA}

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Repeat args (they don’t persist automatically between stages)
ARG BUILD_VERSION=dev
ARG GIT_SHA=local

# OCI labels
LABEL org.opencontainers.image.title="Quad Delta API" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}"

ENV APP_VERSION=${BUILD_VERSION} GIT_SHA=${GIT_SHA}

COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "DbShowcase.Api.dll"]
