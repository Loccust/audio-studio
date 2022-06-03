export default class AudioController {
  test=0;
  constructor(audioService) {
    this.audioService = audioService;
  }
  async getBitRate(req, res) {
    const fx = "audio/fx/fart-128kbps.mp3";
    // const bitRate = this.audioService.getBitRate(fx);
    console.log(this.test)
    // res.json({ bitRate: `${bitRate}` });
  }

  async mixAudio(req, res) {
    const song = "audio/songs/conversation.mp3";
    const fx = "audio/fx/fart-128kbps.mp3";
    const mix = this.audioService.mixAudio(song, fx);
    res.json({ mix: `${mix}` });
    }
}
