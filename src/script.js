// Getting elements...
const langSelect = document.getElementById('langSelect');
const levelSelect = document.getElementById('levelSelect');
const fileInput = document.getElementById('fileInput');
const ocrButton = document.getElementById('ocrButton');
const extractSelect = document.getElementById('extractSelect');
const extractButton = document.getElementById('extractButton');
const imageContainer = document.getElementById('imageContainer');
const textOutput = document.getElementById('textOutput');
const errortext = document.getElementById('errortext');
let extractedText = '';
// Change the Display image when it get changed
fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];
  imageContainer.src = URL.createObjectURL(file);
});
// Perform OCR button function
async function performOCR() {
// Getting values
  const lang = langSelect.value;
  const level = levelSelect.value;
  let pathtolangs;
// What folder to get tessdata from
  switch(level){
	  case 'normal':
	  pathtolangs = './lang';
	  break;
	  case 'bad':
	  pathtolangs = './lang_fast';
	  break;
	  case 'best':
	  pathtolangs = './lang_best';
	  break;
	  default:
	  pathtolangs = './langs'
	  break;
  }
  if (lang && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    ocrButton.disabled = true;
    ocrButton.classList.add('disabled');
    textOutput.innerHTML = '<div></span><span>Loading...</span></div>';

    try {
      const { createWorker } = Tesseract;

      const worker = await createWorker(lang, 1,{
        workerPath: "./dist/worker.min.js",
		corePath: "./dist/tesseract.js-core/tesseract-core.wasm.js",
		langPath: pathtolangs,
        logger: m => console.log(m)
      });
      const { data: { text } } = await worker.recognize(file);

      if (text) {
		result(text);
		await worker.terminate();
      } else {
        textOutput.innerText = 'No text found.';
        extractedText = '';
		await worker.terminate();
      }

      imageContainer.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Uploaded Image">`;
    } catch (error) {
	errortext.innerText = 'Error: OCR Failed';
      //textOutput.innerText = 'Error: OCR failed.';
      textOutput.classList.add('error');
	  console.log(error);
      extractedText = '';
    }

    ocrButton.disabled = false;
    ocrButton.classList.remove('disabled');
  } else {
	errortext.innerText = 'Please select a language and an image file.';
	//textOutput.innerText = 'Please select a language and an image file.';
  }
}

function extractText() {
  const fileType = extractSelect.value;

  if (fileType && extractedText) {
	  errortext.innerText = '';
    const blob = new Blob([extractedText], {
      type: `text/${fileType}`
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_text.${fileType}`;
    link.click();
  } else {
	errortext.innerText = 'Please select a file type and perform OCR first.';
	//textOutput.innerText = 'Please select a file type and perform OCR first.';
  }
}
function result(res){
	errortext.innerText = '';
	// octx.clearRect(0, 0, output.width, output.height)
	// octx.textAlign = 'left'

	console.log('result was:', res)
	// output_overlay.style.display = 'none'
	// output_text.innerHTML = res.text
	textOutput.innerText = res;
    extractedText = res;
}
