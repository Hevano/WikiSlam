namespace WikiSlam.Models
{
    public class ResultEntry
    {
        public Article Article { get; set; }
        public User User { get; set; }
        public Dictionary<int, int> WinLossRecord { get; set; }
        public int Score { get; set; }

        public ResultEntry(Article a, User u)
        {
            Article = a;
            User = u;
            Score = 0;
            WinLossRecord = new Dictionary<int, int>();
        }
    }
}
