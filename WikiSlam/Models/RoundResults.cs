namespace WikiSlam.Models
{
    public class RoundResults
    {
        public List<ResultEntry> resultsList { get; set; }
        public int Winner { get; set; }
        public int LobbyId { get; set; }

        public RoundResults(int id)
        {
            LobbyId = id;
            resultsList = new List<ResultEntry>();
        }
    }
}
