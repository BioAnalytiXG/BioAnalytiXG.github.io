var words = ['REPORTS', 'AUTOMATION','throught the web'];
var wordIndex = 0;
var letterIndex = 0;
var isDeleting = false;
var changingWord = document.getElementById('changing-word');

function typeDeleteWord() {
  var word = words[wordIndex % words.length];

  if (isDeleting) {
    changingWord.textContent = word.substring(0, letterIndex--);
    if (letterIndex < 0) {
      isDeleting = false;
      wordIndex++;
    }
  } else {
    changingWord.textContent = word.substring(0, letterIndex++);
    if (letterIndex > word.length) {
      isDeleting = true;
      setTimeout(typeDeleteWord, 6000); // pause before start deleting
      return;
    }
  }

  setTimeout(typeDeleteWord, 100);
}

typeDeleteWord();
