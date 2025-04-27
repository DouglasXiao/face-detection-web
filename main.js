// Initialize model variable
let model;

// Load model when page loads
async function loadModel() {
    try {
        console.log('Loading BlazeFace model...');
        model = await blazeface.load();
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
        alert('Error loading model: ' + error.message);
    }
}

// Call loadModel when page loads
loadModel();

async function handleUpload(event) {
    if (!model) {
        alert('Model is still loading. Please wait a moment and try again.');
        return;
    }

    const file = event.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
        try {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Run face detection
            console.log('Running face detection...');
            const predictions = await model.estimateFaces(img, false);
            console.log('Detected faces:', predictions);

            // Draw bounding boxes
            drawBoundingBoxes(ctx, predictions);
        } catch (error) {
            console.error('Error during face detection:', error);
            alert('Error processing image: ' + error.message);
        }
    }
}

function drawBoundingBoxes(ctx, predictions) {
    if (!predictions || predictions.length === 0) {
        console.log('No faces detected');
        return;
    }

    // Process each prediction
    predictions.forEach(prediction => {
        // Get the bounding box
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        // Draw rectangle
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(start[0], start[1], size[0], size[1]);

        // Draw confidence score
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px Arial';
        ctx.fillText(prediction.probability[0].toFixed(2), start[0], start[1] - 5);

        // Draw facial landmarks (optional)
        if (prediction.landmarks) {
            ctx.fillStyle = '#FF0000';
            prediction.landmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(landmark[0], landmark[1], 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    });
}

const uploadInput = document.getElementById('upload');
uploadInput.addEventListener('change', handleUpload);