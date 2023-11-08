namespace WikiSlam.Models
{
    public class Article
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string Title { get; set; }

        public short Level { get; set; }

        //Generic RPG stats, to be changed later
        public short Strength { get; set; }
        public short Dexterity { get; set; }
        public short Willpower { get; set; }

        //Navigation property
        public virtual User User { get; set; }
    }
}
