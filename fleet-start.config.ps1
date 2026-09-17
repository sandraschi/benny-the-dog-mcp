# Per-repo fleet start config for benny-the-dog-mcp
# Edit ports/backend target here - start.ps1 is fleet-standard.
@{
    Name         = 'benny-the-dog-mcp'
    BackendPort  = 11142
    FrontendPort = 11143
    HealthPath   = '/api/health'
    WebRoot      = 'webapp'
    Backend = @{
        Kind          = 'uvicorn'
        UvicornTarget = 'benny_the_dog_mcp.server:app'
        Env           = @{ WEB_PORT = '11142' }
    }
    Frontend = @{
        Kind           = 'vite-npm'
        PackageManager = 'npm'
        PortEnvVar     = 'VITE_PORT'
        ApiTargetEnv   = 'VITE_API_TARGET'
    }
}
