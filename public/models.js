let editingModelId = null; // track editing model_id
let currentPage = 1;
const modelsPerPage = 5;
let totalModels = 0;

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

document.getElementById('modelForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const model_name = document.getElementById('modelName').value.trim();
    const huggingface_name = document.getElementById('huggingfaceName').value.trim();
    const precision = document.getElementById('precision').value;
    const url = editingModelId ? `/admin/models/${editingModelId}` : '/admin/models';
    const method = editingModelId ? 'PUT' : 'POST';

    if (!precision || !model_name || !huggingface_name) {
        setFeedback('all fields are required');
        return;
    }

    const modelData = { model_name, huggingface_name, precision };

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
    })
    .then(response => response.json())
    .then(data => {
        setFeedback(data.feedback);
        document.getElementById('modelName').value = '';
        document.getElementById('huggingfaceName').value = '';
        document.getElementById('precision').selectedIndex = 0;
        editingModelId = null; // Reset editing mode
        loadModels(currentPage); // Keep current page when reloading
        cancelEdit(); // Reset form to "add" mode
    })
    .catch(error => console.error('Error:', error));
});

function cancelEdit() {
    editingModelId = null;
    document.getElementById('modelName').value = '';
    document.getElementById('huggingfaceName').value = '';
    document.getElementById('precision').value = 'fp32'; // Or your default type
    document.getElementById('modelFormButton').textContent = 'Add Model';
    document.getElementById('cancelEditButton').style.display = 'none';
}

function editModel(model_id, modelName, huggingfaceName, precision) {
    editingModelId = model_id;
    document.getElementById('modelName').value = modelName;
    document.getElementById('huggingfaceName').value = huggingfaceName;
    document.getElementById('precision').value = precision;
    document.getElementById('modelFormButton').textContent = 'Save Changes';
    document.getElementById('cancelEditButton').style.display = 'inline';
}

function deleteModel(model_id) {
    const dialog = document.getElementById('deleteConfirmDialog');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    dialog.style.display = 'block';

    confirmBtn.onclick = function() {
        dialog.style.display = 'none';
        fetch(`/admin/models/${model_id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if(data.error) { throw new Error(data.error); }
            setFeedback(`Model deleted: ${model_id}`);
            loadModels(currentPage);  // Reload the models after deletion
        })
        .catch(error => {
            console.error('Error:', error);
            setFeedback(error.toString());
        });
    };

    cancelBtn.onclick = function() {
        dialog.style.display = 'none';
    };

    // Close the dialog if clicked outside
    window.onclick = function(event) {
        if (event.target == dialog) {
            dialog.style.display = 'none';
        }
    };
}

function loadModels(page = 1) {
    currentPage = page;
    fetch(`/admin/models?page=${page}&limit=${modelsPerPage}`)
    .then(response => response.json())
    .then(data => {
        const modelsList = document.getElementById('modelsList');
        modelsList.innerHTML = '';

        data.models.forEach(model => {
            const listItem = document.createElement('li');
            const precision = model.precision;
            listItem.innerHTML = `
                <div>
                    <button type="button" class="delete-button btn-secondary" data-modelId="${model.model_id}">Delete</button>
                    <button type="button" class="edit-button btn-primary" data-modelId="${model.model_id}" data-modelName="${model.model_name}" data-huggingfaceName="${model.huggingface_name}" data-precision="${model.precision}">Edit</button>
                </div>
                <div>
                    <span>model</span>
                    <div><a href="https://huggingface.co/${model.huggingface_name}" target="model">${model.model_name}</a></div>
                </div>
                <div>
                    <span>precision</span>
                    <div>${precision}</div>
                </div>
            `;
            modelsList.appendChild(listItem);
        });

        totalModels = data.total;
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
    const totalPages = Math.ceil(totalModels / modelsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalModels} total models)`;

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const firstButton = document.getElementById('firstButton');
    const lastButton = document.getElementById('lastButton');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    firstButton.disabled = currentPage === 1;
    lastButton.disabled = currentPage === totalPages;
}

document.getElementById('firstButton').addEventListener('click', () => loadModels(1));
document.getElementById('prevButton').addEventListener('click', () => loadModels(currentPage - 1));
document.getElementById('nextButton').addEventListener('click', () => loadModels(currentPage + 1));
document.getElementById('lastButton').addEventListener('click', () => {
    const totalPages = Math.ceil(totalModels / modelsPerPage);
    loadModels(totalPages);
});

function attachEditButtonEventListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const model_id = this.getAttribute('data-modelId');
            const model_name = this.getAttribute('data-modelName');
            const huggingface_name = this.getAttribute('data-huggingfaceName');
            const precision = this.getAttribute('data-precision');
            editModel(model_id, model_name, huggingface_name, precision);
        });
    });
}

function attachDeleteButtonEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const model_id = this.getAttribute('data-modelId');
            deleteModel(model_id);
        });
    });
}

// Initial load of models
loadModels();