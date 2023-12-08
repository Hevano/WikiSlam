using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data.Entity;

namespace WikiSlam.DAL
{
    public class LobbyCleanupService : BackgroundService
    {
        /*private WikiSlamContext _dbContext;
        public LobbyCleanupService(WikiSlamContext wikiSlamContext)
        {
            _dbContext = wikiSlamContext;
        }*/

        private readonly IServiceProvider _serviceProvider;

        public LobbyCleanupService(IServiceProvider serviceProvider) 
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using PeriodicTimer timer = new PeriodicTimer(TimeSpan.FromHours(1));
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var services = scope.ServiceProvider;
                    var dbContext = services.GetService<WikiSlamContext>();
                    //Remove all lobbies where a round hasn't been started in the past hour
                    if (!dbContext.Lobbies.IsNullOrEmpty())
                    {
                        var cutoff = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - TimeSpan.FromHours(1).Seconds;
                        var staleLobbies = dbContext.Lobbies.Where(lobby => lobby.RoundStartTimestamp < cutoff).ToList();
                        dbContext.Lobbies.RemoveRange(staleLobbies);
                        await dbContext.SaveChangesAsync();
                    }
                    
                    Console.WriteLine("Tick");
                    dbContext.Dispose();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("ERROR ATTEMPTING TO DELETE STALE LOBBIES", ex);
                }
                await timer.WaitForNextTickAsync();
            }
        }
    }
}
