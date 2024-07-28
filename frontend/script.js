function refreshPage() {
    location.reload();
}


document.getElementById('copyimage').addEventListener('click', function() {
    // Create a temporary input element to hold the URL
    const tempInput = document.createElement('input');
    tempInput.value = window.location.href; // Get the current URL
    document.body.appendChild(tempInput);

    // Select the input value and copy it to the clipboard
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');

    // Remove the temporary input element
    document.body.removeChild(tempInput);

    // Optionally, provide feedback to the user
    alert('URL copied to clipboard!');
});