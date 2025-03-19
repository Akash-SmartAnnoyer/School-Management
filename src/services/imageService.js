import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

// Cloudinary configuration
const CLOUD_NAME = 'dyr02bpil';
const UPLOAD_PRESET = 'school_management';

const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME
  }
});

export const getCloudinaryImage = (publicId) => {
  if (!publicId) return null;
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(100).height(100));
};

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'school_management/students'); // Organize uploads in folders

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
          signature: process.env.REACT_APP_CLOUDINARY_SIGNATURE,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 