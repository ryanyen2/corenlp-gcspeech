const { Properties, Pipeline, ConnectorServer } = require("corenlp");
const connector = new ConnectorServer({ dsn: "http://localhost:9000" });
const props = new Properties({
  annotators: "tokenize,ssplit,pos,lemma,ner,parse",
});
const pipeline = new Pipeline(props, "English", connector);

//function to start the pipeline
exports.startPipeline = () => {
  pipeline.start();
};

//function to end the pipeline
exports.endPipeline = () => {
  pipeline.end();
};

//function to get the output of the pipeline
exports.getNLPOutput = (text) => {
  pipeline.annotate(text, (err, response) => {
    console.log(`NLP_RESPONSE: ${response}`);
    return err, response;
  });
};
