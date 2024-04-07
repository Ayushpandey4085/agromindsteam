


let disease=document.querySelector("#disease");




    console.log("Hello world");
    
let button = document.querySelector(".button");

button.addEventListener("click", () => {
    const uploadInput = document.getElementById("uploadInput");
    const file = uploadInput.files[0];

    if (file) {
        displayImagePreview(file);
        init(file);
        console.log("Button is clicked");
    } else {
        console.log("Please select an image.");
    }
});

let mydisease;

const URL = "../disease-detection-model/";
let model, webcam, labelContainer, maxPredictions;

async function init(imageFile) {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

     // Create and append elements to the DOM
     const webcamContainer = document.getElementById("webcam-container");
     const labelContainerWrapper = document.createElement("div");
     labelContainerWrapper.id = "label-container";
     document.body.insertBefore(labelContainerWrapper, webcamContainer.nextSibling);
 
     labelContainer = document.getElementById("label-container");

    const image = new Image();
    const reader = new FileReader();

    reader.onload = async function (e) {
        image.src = e.target.result;
        image.onload = async function () {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, 200, 200);
            predict(canvas);
        };
    };

    reader.readAsDataURL(imageFile);
}

async function predict(canvas) {
    const prediction = await model.predict(canvas);

    // Find the index of the prediction with the highest probability
    const maxIndex = prediction.reduce((maxIndex, currentPrediction, currentIndex, array) => {
        return currentPrediction.probability > array[maxIndex].probability ? currentIndex : maxIndex;
    }, 0);

    // Store the name of the class with the highest probability in the variable 'maximum'
    let mypredection = prediction[maxIndex].className;

    // Display the prediction with the highest probability
    // const classPrediction = mypredection + ": " + prediction[maxIndex].probability.toFixed(2);
    // labelContainer.innerHTML = "<div>" + classPrediction + "</div>";

    // Now, 'mypredection' contains the name of the class with the highest probability
    console.log("Highest probability class: ", mypredection);
    mydisease=mypredection;
    disease.innerText=mypredection;
    sendMessage(mydisease);


    


}

// Function to display image preview
function displayImagePreview(file) {
    const imagePreview = document.getElementById("imagePreview");
    const reader = new FileReader();

    reader.onload = function (e) {
        const previewImage = document.createElement("img");
        previewImage.src = e.target.result;
        imagePreview.innerHTML = "";
        imagePreview.appendChild(previewImage);
    };

    reader.readAsDataURL(file);
}








// this funciton is for chatgpt
function sendMessage(mydisease) {
    // const userInput = document.getElementById("userInput").value;
    // if (!userInput) return;
    console.log(mydisease);
   

    const chatContainer = document.getElementById("chatContainer");
    const userMessage = document.createElement("p");
    
    chatContainer.appendChild(userMessage);

    fetch(`/api/chat?message=${encodeURIComponent(`Tell me about this ${mydisease} and its cure `)}`)
        .then(response => response.json())
        .then(data => {
            const chatResponse = document.createElement("p");
            chatResponse.style.color="white";
            chatResponse.innerText = `AgroMinds: ${data.message}`;
            chatContainer.appendChild(chatResponse);
        })
        .catch(error => console.error("Error fetching data:", error));



}




