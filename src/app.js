const API_URL = 'https://api.jsonbin.io/v3/b/6225baad06182767436f1fb7',
API_KEY = '$2b$10$ujih63v68on4vvZVG3k9Ee52lM6DTXCsEsPGlzQ35blpuOLP8dN9S',
      video = document.querySelector('video'),
      canvas = document.querySelector('canvas'),
      buttonShowGallery = document.querySelector('.show-gallery-img')
      buttonShowPreview = document.querySelector('.show-preview-img')
      buttonSnap = document.querySelector('#button-snap'),
      buttonAgain = document.querySelector('#button-again'),
      buttonGallery1 = document.querySelector("#button-gallery-1")
      buttonGallery2 = document.querySelector("#button-gallery-2")
      viewVideoPreview = document.querySelector('#video-preview'),
      viewPhotoPreview = document.querySelector('#photo-preview'),
      viewGallery = document.querySelector("#gallery-view"),
      previewImage = document.querySelector('#preview-image'),
      ctx = canvas.getContext('2d'),
      galleryContainer = document.querySelector("#gallery-container");
      
let photos = [],    
    mediaStream;
      

window.addEventListener('load', async () => {
    if('serviceWorker' in navigator){
        try {
            await navigator.serviceWorker.register('serviceworker.js');
        } catch(err) {
            console.error('Whooopsie!', err)
        }
    }
});

function uuidv4() 
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function render()
{ 
    galleryContainer.innerHTML = '';
    photos.forEach(photo => {       
        
        // Insert Html
        let html = `<li class="photo-list-item"><img src="${photo.imgData}" class="photo-image" /><img id="delete-image-${photo.id}" class="delete-image" src="assets/delete.svg" /></li>`
        galleryContainer.insertAdjacentHTML('beforeend', html)

        // Add handlers        
        deleteImage = document.querySelector(`#delete-image-${photo.id}`)                
        if (deleteImage.getAttribute('listener') === 'true') {
            deleteImage.removeEventListener('click', deletePhoto);
        }

        deleteImage.addEventListener('click', deletePhoto);
        deleteImage.photoId = photo.id;
        
    })
}

async function getData(){
    
    if(localStorage.getItem(['WeddingPhotograph'])){
        photos = JSON.parse(localStorage.getItem('WeddingPhotograph')).photos;
        render();
    }

    try {

        let resp = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'X-Master-Key' : API_KEY
            }
        });

        let data = await resp.json();
        photos = data.record.photos;
        render();

    } catch(err) {
        console.error(err)
    }
}
    

async function setData(data)
{    
    // Add to internal array
    photos.push({
        id: uuidv4(), // photos.length + 1,
        imgData: data
    })

    saveData();
}

async function saveData() {

    // Add complete array of photos to local storage
    localStorage.setItem('WeddingPhotograph', JSON.stringify({ photos: photos }))

    // Add complete array of photos to cloud
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
                'X-Master-Key' : API_KEY
            },
            body: JSON.stringify({photos: photos})
        });

    } catch(err) {
        console.error(err);
    }

}

function startStream(){

    if(navigator.mediaDevices){

        navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then(stream => {
            mediaStream = stream;
            video.srcObject = stream;
        })
        .catch(err => console.error(err))

    } else {
        console.log('No mediadevices found.')
    }
}

function captureImage(){
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL('image/png');

    previewImage.setAttribute('src', data)

    return data;
}

function showGallery()
{
    viewVideoPreview.style.visibility = "hidden"
    viewPhotoPreview.style.visibility = "hidden"    
    viewGallery.style.visibility = "visible"        
}

function showVideoPreview()
{
    viewVideoPreview.style.visibility = "visible"
    viewPhotoPreview.style.visibility = "hidden"    
    viewGallery.style.visibility = "hidden"        
}

function showPhotoPreview()
{
    viewVideoPreview.style.visibility = "hidden"
    viewPhotoPreview.style.visibility = "visible"    
    viewGallery.style.visibility = "hidden"        
}

async function deletePhoto(evt)
{    
    let photoId = evt.currentTarget.photoId;
    photos =  photos.filter(photo => photo.id !== photoId);

    if (photos.length == 0) {
        showVideoPreview()
    }

    saveData();
    render();

}


async function init(){

    buttonSnap.addEventListener('click', () => {        
        let data = captureImage();
        setData(data);

        showPhotoPreview();
        render();
    });
    
    buttonAgain.addEventListener('click', () => {        
        showVideoPreview();
    });

    buttonGallery1.addEventListener('click', () => {        
        showGallery()
    });

    buttonGallery2.addEventListener('click', () => {        
        showGallery()
    });

    buttonShowPreview.addEventListener('click', () => {        
        showVideoPreview()
    });

    showVideoPreview();
    startStream();

    await getData();
    render();
}

init();