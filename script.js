var classifier = new EdgeImpulseClassifier();
classifier.init();

// Set up the AudioContext.
const audioCtx = new AudioContext();

// Top-level variable keeps track of whether we are recording or not.
let recording = false;

// Ask user for access to the microphone.
if (navigator.mediaDevices) {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream, options) => {
      var options = {
        audioBitsPerSecond: 128000,
      };
      // Instantiate the media recorder.
      const mediaRecorder = new MediaRecorder(stream, options);

      // Create a buffer to store the incoming data.
      let chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        console.log("1 second audio chunk");
        chunks.push(event.data);
        // console.log(event.data);
        let blob = event.data;
        blobarray = blob.arrayBuffer();
        blobarray
          .then((arrayBuffer) => {
            // console.log(arrayBuffer);
            var int8array = new Int8Array(arrayBuffer);
            console.log(int8array);

            // let int8array = new TextEncoder().encode(int8View);
            // var int8string = new TextDecoder().decode(int8array);
            // console.log(int8string);

            // const int16array = [];

            // console.log(int16array);
            for (let j = 0; j < 2000; j++) {
              const int16array = new Array(16000).fill(0);
              for (
                let i = 0;
                i < int8array.length && i < int16array.length;
                i++
              ) {
                let val = Math.floor((20000 / 128) * int8array[i + j * 40]);
                val = Math.min(32767, val);
                val = Math.max(-32768, val);

                if (i + j * 40 < int8array.length) {
                  int16array[i] = val;
                }

                // int16array.push(val);
              }

              let res = classifier.classify(int16array);
              if (res.results[0].value > 0.2) {
                console.log(res.results[0], res.results[1], res.results[2]);
                console.log(int16array);
                $("#hello-world").html("Hello World");
              }
            }

            // console.log(int16array);
            // let int16View = new TextEncoder().encode(int16array);
            // var int16string = new TextDecoder().decode(int16View);
            // console.log(int16string);
            // $("#int16").html(int16string);

            // let res = classifier.classify(int16array);
            // console.log(res.results[0], res.results[1], res.results[2]);
            // console.log(int16array);
          })
          .catch((err) => {
            console.log(err);
          });
      };

      // When you stop the recorder, create a empty audio clip.
      mediaRecorder.onstop = (event) => {
        const audio = new Audio();
        audio.setAttribute("controls", "");
        $("#sound-clip").append(audio);
        $("#sound-clip").append("<br />");

        // Combine the audio chunks into a blob, then point the empty audio clip to that blob.
        let blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

        audio.src = window.URL.createObjectURL(blob);

        // console.log(audio.src);
        // console.log(blobarray);

        // Clear the `chunks` buffer so that you can record again.
        chunks = [];
      };

      let sec1Loop;

      // Set up event handler for the "Record" button.
      $("#record").on("click", () => {
        if (recording) {
          mediaRecorder.stop();
          clearInterval(sec1Loop);
          console.log("stop");
          recording = false;
          $("#record").html("Record");
        } else {
          mediaRecorder.start();
          sec1Loop = setInterval(() => {
            mediaRecorder.stop();
            mediaRecorder.start();
          }, 5000);
          console.log("start");
          recording = true;
          $("#record").html("Stop");
        }
      });
    })
    .catch((err) => {
      // Throw alert when the browser is unable to access the microphone.
      alert("Oh no! Your browser cannot access your computer's microphone.");
    });
} else {
  // Throw alert when the browser cannot access any media devices.
  alert(
    "Oh no! Your browser cannot access your computer's microphone. Please update your browser."
  );
}
