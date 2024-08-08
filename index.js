require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Function to change WhatsApp Business Account profile picture
async function changeWhatsAppProfilePicture() {
  try {
    const imageUrl = process.env.IMAGE_URL;
    const accessToken = process.env.ACCESS_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    // Step 1: Download the image from the provided URL
    const imageResponse = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    // Save the image locally
    const imagePath = path.resolve(__dirname, 'whatsappprofile.jpg');
    fs.writeFileSync(imagePath, imageResponse.data);

    // Step 2: Upload the image to WhatsApp Cloud API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const uploadResponse = await axios.post(`https://graph.facebook.com/v13.0/${phoneNumberId}/media`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    });

    // Get the media ID from the upload response
    const mediaId = uploadResponse.data.id;

    // Step 3: Set the uploaded image as the profile picture
    const profileResponse = await axios.post(`https://graph.facebook.com/v13.0/${phoneNumberId}/whatsapp_business_profile`, {
      profile_picture_media_id: mediaId
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Profile picture updated successfully:', profileResponse.data);
  } catch (error) {
    console.error('Error updating profile picture:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
    if (error.response && error.response.headers) {
      console.error('Response headers:', error.response.headers);
    }
    console.error('Full error object:', error);
  }
}

changeWhatsAppProfilePicture();

