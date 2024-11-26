let editingPhraseId = null;
let currentPage = 1;
const phrasesPerPage = 5;
let totalPhrases = 0;

function setFeedback(message) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = message;
    setTimeout(() => {
        feedback.innerHTML = '';
    }, 5000);
}

document.getElementById('phraseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const phrase = document.getElementById('phraseText').value.trim();
    const topicTags = document.getElementById('topicTags').value;
    const topic_ids = topicTags.split(',').map(tag => parseInt(tag.trim())).filter(id => !isNaN(id));

    const url = editingPhraseId ? `/admin/phrases/${editingPhraseId}` : '/admin/phrases';
    const method = editingPhraseId ? 'PUT' : 'POST';

    if (!phrase) {
        setFeedback('Phrase is required');
        return;
    }

    const phraseData = { phrase, topic_ids };

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phraseData)
    })
    .then(response => response.json())
    .then(data => {
        setFeedback(data.feedback);
        document.getElementById('phraseText').value = '';
        document.getElementById('topicTags').value = '';
        editingPhraseId = null;
        loadPhrases();
        cancelEdit();
    })
    .catch(error => console.error('Error:', error));
});

function cancelEdit() {
    editingPhraseId = null;
    document.getElementById('phraseText').value = '';
    document.getElementById('topicTags').value = '';
    document.getElementById('phraseFormButton').textContent = 'Add Phrase';
    document.getElementById('cancelEditButton').style.display = 'none';
}

function editPhrase(phrase_id, phraseText, topicIds) {
    editingPhraseId = phrase_id;
    document.getElementById('phraseText').value = phraseText;
    document.getElementById('topicTags').value = topicIds.join(',');
    document.getElementById('phraseFormButton').textContent = 'Save Changes';
    document.getElementById('cancelEditButton').style.display = 'inline';
}

function deletePhrase(phrase_id) {
    const dialog = document.getElementById('deleteConfirmDialog');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    dialog.style.display = 'block';

    confirmBtn.onclick = function() {
        dialog.style.display = 'none';
        fetch(`/admin/phrases/${phrase_id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if(data.error) { throw new Error(data.error); }
            setFeedback(`Phrase deleted: ${phrase_id}`);
            loadPhrases();
        })
        .catch(error => {
            console.error('Error:', error);
            setFeedback(error.toString());
        });
    };

    cancelBtn.onclick = function() {
        dialog.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == dialog) {
            dialog.style.display = 'none';
        }
    };
}

function loadPhrases(page = 1) {
    currentPage = page;
    fetch(`/admin/phrases?page=${page}&limit=${phrasesPerPage}`)
    .then(response => response.json())
    .then(data => {
        const phrasesList = document.getElementById('phrasesList');
        phrasesList.innerHTML = '';

        data.phrases.forEach(phrase => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <button type="button" class="delete-button btn-secondary" data-phraseId="${phrase.phrase_id}">Delete</button>
                    <button type="button" class="edit-button btn-primary" data-phraseId="${phrase.phrase_id}" data-phraseText="${phrase.phrase}">Edit</button>
                </div>
                <div>
                    <span>phrase</span>
                    <div>${phrase.phrase}</div>
                </div>
            `;
            phrasesList.appendChild(listItem);
        });

        totalPhrases = data.total;
        updatePagination();
        attachEditButtonEventListeners();
        attachDeleteButtonEventListeners();
    })
    .catch(error => {
        console.error('Error:', error);
        setFeedback(error.toString());
    });
}

function updatePagination() {
    const totalPages = Math.ceil(totalPhrases / phrasesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalPhrases} total phrases)`;

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const firstButton = document.getElementById('firstButton');
    const lastButton = document.getElementById('lastButton');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPhrases === 0;
    firstButton.disabled = currentPage === 1;
    lastButton.disabled = currentPage === totalPages || totalPhrases === 0;
}

document.getElementById('firstButton').addEventListener('click', () => loadPhrases(1));
document.getElementById('prevButton').addEventListener('click', () => loadPhrases(currentPage - 1));
document.getElementById('nextButton').addEventListener('click', () => loadPhrases(currentPage + 1));
document.getElementById('lastButton').addEventListener('click', () => {
    const totalPages = Math.ceil(totalPhrases / phrasesPerPage);
    loadPhrases(totalPages);
});

function attachEditButtonEventListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const phrase_id = this.getAttribute('data-phraseId');
            const phraseText = this.getAttribute('data-phraseText');
            editPhrase(phrase_id, phraseText, []);  // We don't have topic IDs here, so passing an empty array
        });
    });
}

function attachDeleteButtonEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const phrase_id = this.getAttribute('data-phraseId');
            deletePhrase(phrase_id);
        });
    });
}

// Initial load of phrases
loadPhrases();