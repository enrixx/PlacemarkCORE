document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector("#file-select input[type=file]");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        const fileName = e.target.files[0].name;
        const fileNameElement = document.querySelector("#file-select .file-name");
        if (fileNameElement) {
          fileNameElement.textContent = fileName;
        }
      }
    });
  }
});

