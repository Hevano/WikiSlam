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

        //Returns 1 if better, -1 if worse, 0 if equal
        public int Compare(Article other)
        {
            int score = 0;

            //Having a greater stat than other gives +1 score, -1 if less stat, and +0 if equal
            score += Math.Min(Math.Max(Strength - other.Strength, -1), 1);
            score += Math.Min(Math.Max(Dexterity - other.Dexterity, -1), 1);
            score += Math.Min(Math.Max(Willpower - other.Willpower, -1), 1);

            //If still tied, compare level
            if(score == 0)
            {
                score += Math.Min(Math.Max(Level - other.Level, -1), 1);
            }

            //If STILL tied, compare sum of all stats
            if(score == 0)
            {
                score += (Strength + Dexterity + Willpower) - (other.Strength + other.Dexterity + other.Willpower);
            }

            //Return score bounded between 1 and negative 1
            return Math.Min(Math.Max(score, -1), 1);
        }
    }
}
