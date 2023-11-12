namespace WikiSlam.Models
{
    public class User
    {
        public int Id { get; set; }
        public int LobbyId { get; set; }
        public string Name { get; set; }

        public bool IsAdmin { get; set; }

        //Navigation properties
        //public virtual Lobby Lobby { get; set; }
        //public virtual Article Article { get; set; }
    }
}
