import { v2 as cloudinary } from "cloudinary";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageStore = {
  uploadImage: async function (imagefile) {
    const publicDir = "./public";
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }
    const tempPath = `./public/temp-${Date.now()}.img`;
    try {
      writeFileSync(tempPath, imagefile);
      const response = await cloudinary.uploader.upload(tempPath, {
        folder: "placemark-core",
        resource_type: "auto",
        type: "private",
      });
      return {
        url: cloudinary.url(response.public_id, { type: "private", sign_url: true, secure: true }),
        publicId: response.public_id,
      };
    } finally {
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    }
  },

  getSignedUrl: function (publicId) {
    return cloudinary.url(publicId, {
      type: "private",
      sign_url: true,
      secure: true,
    });
  },

  extractPublicId: function (url) {
    try {
      const urlParts = url.split("/");
      const privateIndex = urlParts.findIndex((part) => part === "private");

      if (privateIndex !== -1) {
        let startIndex = privateIndex + 2;

        if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
          startIndex += 1;
        }

        const pathParts = urlParts.slice(startIndex);
        const fullPath = pathParts.join("/").split("?")[0];
        const publicId = fullPath.replace(/\.[^/.]+$/, "");

        return publicId;
      }
      return null;
    } catch (err) {
      console.error("Error extracting public_id:", err);
      return null;
    }
  },

  deleteImage: async function (publicId) {
    await cloudinary.uploader.destroy(publicId, {
      type: "private",
      invalidate: true,
    });
  },
};
