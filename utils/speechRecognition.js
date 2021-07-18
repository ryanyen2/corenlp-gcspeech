// setup google cloud speech recognition
const speech = require("@google-cloud/speech");
const speechClient = new speech.SpeechClient();
const recognizeStream = null;
const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
  },
  interimResults: true,
};

const { getNLPOutput } = require("./coreNLP");
const {emitInRoom} = require("./ioSocket");

exports.writeData = (data) => {
  if (recognizeStream) {
    recognizeStream.write(data);
  }
};

// create function to start the google cloud stream for speech recognition
exports.startRecognitionStream = async (namespaces, room) => {
  recognizeStream = await speechClient
    .streamingRecognize(request)
    .on("error", console.error)
    .on("data", (data) => {
      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : "\n\nReached transcription time limit, press Ctrl+C\n"
      );

      emitInRoom("SPEECH_DATA", { data: data });
      getNLPOutput(
        data.results[0] && data.results[0].alternatives[0]
          ? data.results[0].alternatives[0].transcript
          : "",
        (err, output) => {
          if (err) {
            console.log(err);
            return;
          }
          emitInRoom("NLP_OUTPUT", output);
        }
      );

      if (data.results[0] && data.results[0].isFinal) {
        stopRecognitionStream();
        startRecognitionStream(room);
        console.log("Restarted Stream on Server side");
      }
    });
};

// function to end the google cloud stream
exports.stopRecognitionStream = () => {
  if (recognizeStream) recognizeStream.end();
  recognizeStream = null;
};
