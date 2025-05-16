function sharePost() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Schau dir diesen Blogpost an!',
        url: window.location.href
      }).then(() => {
        console.log('Erfolgreich geteilt');
      }).catch((error) => {
        console.error('Fehler beim Teilen:', error);
      });
    } else {
      alert('Teilen wird von deinem Browser nicht unterstützt.');
    }
  }
  