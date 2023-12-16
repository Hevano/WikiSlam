using WikiSlam.Models;
using NUnit.Framework;

namespace WikiSlamTest
{
    [TestFixture]
    public class LobbyModelTests
    {
        [Test]
        public void IdToCode_MinInput_AAAOutput()
        {
            Assert.That(Lobby.IdToCode(0), Is.EqualTo("aaa"));
        }

        [Test]
        public void IdToCode_MaxInput_ZZZOutput()
        {
            Assert.That(Lobby.IdToCode(17575), Is.EqualTo("zzz"));
        }

        [Test]
        public void IdToCode_NegativeInput_AABOutput()
        {
            Assert.That(Lobby.IdToCode(-1), Is.EqualTo("aab"));
        }

        [Test]
        public void IdToCode_OverflowInput_AAAOutput()
        {
            Assert.That(Lobby.IdToCode(17576), Is.EqualTo("aaa"));
        }

        [Test]
        public void CodeToId_AAAInput_ZeroOutput()
        {
            Assert.That(Lobby.CodeToId("aaa"), Is.EqualTo(0));
        }

        [Test]
        public void CodeToId_ZZZInput_MaxOutput()
        {
            Assert.That(Lobby.CodeToId("zzz"), Is.EqualTo(17575));
        }

        [Test]
        public void CodeToId_LongInput_NegativeOutput()
        {
            Assert.That(Lobby.CodeToId("aaaa"), Is.EqualTo(-1));
        }

        [Test]
        public void CodeToId_EmptyInput_NegativeOutput()
        {
            Assert.That(Lobby.CodeToId(""), Is.EqualTo(-1));
        }

        [Test]
        public void CodeToId_InvalidInput_NegativeOutput()
        {
            Assert.That(Lobby.CodeToId("/-*"), Is.EqualTo(-1));
        }

        [Test]
        public void CodeToId_CapsInput_ZeroOutput()
        {
            Assert.That(Lobby.CodeToId("AAA"), Is.EqualTo(0));
        }
    }
}