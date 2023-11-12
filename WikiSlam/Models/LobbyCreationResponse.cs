namespace WikiSlam.Models
{
    public class LobbyCreationResponse
    {
        public Lobby Lobby { get; set; }
        public User Admin { get; set; }

        public LobbyCreationResponse(Lobby l, User a)
        {
            Lobby = l;
            Admin = a;
        }
    }
}
