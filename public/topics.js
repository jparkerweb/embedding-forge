let editingTopicId = null;
let currentPage = 1;
const topicsPerPage = 5;
let totalTopics = 0;

function setFeedback(message) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = message;
    setTimeout(() => {
        feedback.innerHTML = '';
    }, 5000);
}

document.getElementById('feedback').addEventListener('click', function(event) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';
});

document.getElementById('topicForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const topic_name = document.getElementById('topicName').value.trim();
    const url = editingTopicId ? `/admin/topics/${editingTopicId}` : '/admin/topics';
    const method = editingTopicId ? 'PUT' : 'POST';

    if (!topic_name) {
        setFeedback('Topic name is required');
        return;
    }

    const topicData = { topic_name };

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicData)
    })
    .then(response => response.json())
    .then(data => {
        setFeedback(data.feedback);
        document.getElementById('topicName').value = '';
        editingTopicId = null;
        loadTopics();
        cancelEdit();
    })
    .catch(error => console.error('Error:', error));
});

function cancelEdit() {
    editingTopicId = null;
    document.getElementById('topicName').value = '';
    document.getElementById('topicFormButton').textContent = 'Add Topic';
    document.getElementById('cancelEditButton').style.display = 'none';
}

function editTopic(topic_id, topicName) {
    editingTopicId = topic_id;
    document.getElementById('topicName').value = topicName;
    document.getElementById('topicFormButton').textContent = 'Save Changes';
    document.getElementById('cancelEditButton').style.display = 'inline';
}

function deleteTopic(topic_id) {
    const dialog = document.getElementById('deleteConfirmDialog');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    dialog.style.display = 'block';

    confirmBtn.onclick = function() {
        dialog.style.display = 'none';
        fetch(`/admin/topics/${topic_id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if(data.error) { throw new Error(data.error); }
            setFeedback(`Topic deleted: ${topic_id}`);
            loadTopics();
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

function loadTopics(page = 1) {
    currentPage = page;
    fetch(`/admin/topics?page=${page}&limit=${topicsPerPage}`)
    .then(response => response.json())
    .then(data => {
        const topicsList = document.getElementById('topicsList');
        topicsList.innerHTML = '';

        data.topics.forEach(topic => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <button type="button" class="delete-button btn-secondary" data-topicId="${topic.topic_id}">Delete</button>
                    <button type="button" class="edit-button btn-primary" data-topicId="${topic.topic_id}" data-topicName="${topic.topic_name}">Edit</button>
                </div>
                <div>
                    <span>topic</span>
                    <div>${topic.topic_name}</div>
                </div>
            `;
            topicsList.appendChild(listItem);
        });

        totalTopics = data.total;
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
    const totalPages = Math.ceil(totalTopics / topicsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalTopics} total topics)`;

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const firstButton = document.getElementById('firstButton');
    const lastButton = document.getElementById('lastButton');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalTopics === 0;
    firstButton.disabled = currentPage === 1;
    lastButton.disabled = currentPage === totalPages || totalTopics === 0;
}

document.getElementById('firstButton').addEventListener('click', () => loadTopics(1));
document.getElementById('prevButton').addEventListener('click', () => loadTopics(currentPage - 1));
document.getElementById('nextButton').addEventListener('click', () => loadTopics(currentPage + 1));
document.getElementById('lastButton').addEventListener('click', () => {
    const totalPages = Math.ceil(totalTopics / topicsPerPage);
    loadTopics(totalPages);
});

function attachEditButtonEventListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topic_id = this.getAttribute('data-topicId');
            const topic_name = this.getAttribute('data-topicName');
            editTopic(topic_id, topic_name);
        });
    });
}

function attachDeleteButtonEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topic_id = this.getAttribute('data-topicId');
            deleteTopic(topic_id);
        });
    });
}

// Initial load of topics
loadTopics();
