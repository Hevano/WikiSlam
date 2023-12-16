using System;
using System.Text.RegularExpressions;

namespace WikiSlam.Models
{
    public class Lobby
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public long CreationTimestamp { get; set; }
        public long RoundStartTimestamp { get; set; }

        public TimeSpan RoundDuration { get; set; }

        //Navigation Property
        //public virtual ICollection<User> Users { get; set; }

        public static string IdToCode(int Id)
        {
            Id = Math.Abs(Id) % 17576;
            int[] order = { 3, 2, 1 };
            string output = "";
            foreach (var index in order)
            {
                int remainder =  Id % (int) Math.Pow(26, index - 1);
                var character = (char)(Math.Floor((Id - remainder) / Math.Pow(26, index - 1) + 97));
                Id = remainder;
                output += character;
            }

            return output;
        }

        public static int CodeToId(string Code)
        {
            Code = Code.ToLower();
            if (Code.Length != 3 || !Regex.IsMatch(Code, @"^[a-zA-Z]+$")) return -1;
            int[] order = { 1, 2, 3 };
            int output = 0;
            foreach(var index in order)
            {
                int digit = (int)(Code[Code.Length - index]) - 97;
                output += digit * (int) Math.Pow(26, index - 1);
            }
            return output;
        }

    }
}
