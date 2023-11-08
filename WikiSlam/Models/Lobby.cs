namespace WikiSlam.Models
{
    public class Lobby
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public DateTime CreationTimestamp { get; set; }
        public DateTime RoundStartTimestamp { get; set; }

        public TimeSpan RoundDuration { get; set; }

        //Navigation Property
        public virtual ICollection<User> Users { get; set; }

    }
}
