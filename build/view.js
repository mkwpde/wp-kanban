/******/ (() => { // webpackBootstrap
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
/**
 * Frontend interactive Kanban board with drag-and-drop.
 * Uses native drag events and the WordPress REST API for persistence.
 */

function initKanbanBoard(board) {
  const restNonce = board.dataset.nonce || '';
  const restUrl = board.dataset.restUrl || '';
  const canEdit = board.dataset.canEdit === '1';
  let draggedCard = null;
  let draggedTaskId = null;
  const placeholder = document.createElement('div');
  placeholder.className = 'kanban-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  if (canEdit) {
    initDragAndDrop();
    initAddForms();
    initDeleteButtons();
  }
  function initDragAndDrop() {
    const cards = board.querySelectorAll('.kanban-card');
    cards.forEach(function (card) {
      makeCardDraggable(card);
    });
    const columns = board.querySelectorAll('.kanban-cards');
    columns.forEach(function (col) {
      makeColumnDropTarget(col);
    });
  }
  function makeCardDraggable(card) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', function (e) {
      draggedCard = card;
      draggedTaskId = card.dataset.taskId;
      card.classList.add('kanban-card--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
      requestAnimationFrame(function () {
        card.style.opacity = '0.4';
      });
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('kanban-card--dragging');
      card.style.opacity = '';
      draggedCard = null;
      draggedTaskId = null;
      removePlaceholder();
      removeColumnHighlights();
      updateAllCounts();
    });
  }
  function makeColumnDropTarget(cardsContainer) {
    var column = cardsContainer.closest('.kanban-column');
    cardsContainer.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (column) {
        column.classList.add('kanban-column--drag-over');
      }
      var afterElement = getDragAfterElement(cardsContainer, e.clientY);
      if (afterElement) {
        cardsContainer.insertBefore(placeholder, afterElement);
      } else {
        cardsContainer.appendChild(placeholder);
      }
    });
    cardsContainer.addEventListener('dragleave', function (e) {
      if (!cardsContainer.contains(e.relatedTarget) && e.relatedTarget !== placeholder) {
        if (column) {
          column.classList.remove('kanban-column--drag-over');
        }
        if (placeholder.parentNode === cardsContainer) {
          removePlaceholder();
        }
      }
    });
    cardsContainer.addEventListener('drop', function (e) {
      e.preventDefault();
      if (column) {
        column.classList.remove('kanban-column--drag-over');
      }
      if (!draggedCard) {
        removePlaceholder();
        return;
      }
      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggedCard, placeholder);
      }
      removePlaceholder();
      draggedCard.classList.remove('kanban-card--dragging');
      draggedCard.style.opacity = '';
      var columnId = cardsContainer.dataset.columnId;
      persistCardPositions(cardsContainer, columnId);
      var emptyMsg = cardsContainer.querySelector('.kanban-empty');
      if (emptyMsg) {
        emptyMsg.remove();
      }
      updateAllCounts();
    });
  }
  function getDragAfterElement(container, y) {
    var draggableElements = Array.from(container.querySelectorAll('.kanban-card:not(.kanban-card--dragging)'));
    var closest = null;
    var closestOffset = Number.NEGATIVE_INFINITY;
    draggableElements.forEach(function (child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closest = child;
      }
    });
    return closest;
  }
  function removePlaceholder() {
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }
  function removeColumnHighlights() {
    board.querySelectorAll('.kanban-column--drag-over').forEach(function (col) {
      col.classList.remove('kanban-column--drag-over');
    });
  }
  function persistCardPositions(cardsContainer, columnId) {
    var cards = cardsContainer.querySelectorAll('.kanban-card');
    var tasks = [];
    cards.forEach(function (card, index) {
      tasks.push({
        id: parseInt(card.dataset.taskId, 10),
        column_id: parseInt(columnId, 10),
        order: index
      });
    });
    if (tasks.length === 0) {
      return;
    }
    fetch(restUrl + 'telex-kanban/v1/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': restNonce
      },
      body: JSON.stringify({
        tasks: tasks
      })
    }).catch(function (err) {
      console.error('Kanban reorder failed:', err);
    });
  }
  function initAddForms() {
    var addButtons = board.querySelectorAll('.kanban-add-btn');
    addButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var addCard = btn.closest('.kanban-add-card');
        var form = addCard.querySelector('.kanban-add-form');
        btn.style.display = 'none';
        form.style.display = 'flex';
        var titleInput = form.querySelector('.kanban-input-title');
        if (titleInput) {
          titleInput.focus();
        }
      });
    });
    var cancelButtons = board.querySelectorAll('.kanban-cancel-btn');
    cancelButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var addCard = btn.closest('.kanban-add-card');
        var form = addCard.querySelector('.kanban-add-form');
        var addBtn = addCard.querySelector('.kanban-add-btn');
        form.style.display = 'none';
        addBtn.style.display = '';
        resetForm(form);
      });
    });
    var submitButtons = board.querySelectorAll('.kanban-submit-btn');
    submitButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var addCard = btn.closest('.kanban-add-card');
        var form = addCard.querySelector('.kanban-add-form');
        var columnEl = addCard.closest('.kanban-column');
        var columnId = columnEl.querySelector('.kanban-cards').dataset.columnId;
        var titleInput = form.querySelector('.kanban-input-title');
        var descInput = form.querySelector('.kanban-input-desc');
        var title = titleInput ? titleInput.value.trim() : '';
        var description = descInput ? descInput.value.trim() : '';
        if (!title) {
          if (titleInput) {
            titleInput.focus();
          }
          return;
        }
        btn.disabled = true;
        fetch(restUrl + 'telex-kanban/v1/create-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': restNonce
          },
          body: JSON.stringify({
            title: title,
            description: description,
            column_id: parseInt(columnId, 10)
          })
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          if (data.success && data.task) {
            var cardsContainer = columnEl.querySelector('.kanban-cards');
            var emptyMsg = cardsContainer.querySelector('.kanban-empty');
            if (emptyMsg) {
              emptyMsg.remove();
            }
            var newCard = createCardElement(data.task);
            cardsContainer.appendChild(newCard);
            if (canEdit) {
              makeCardDraggable(newCard);
            }
            resetForm(form);
            form.style.display = 'none';
            addCard.querySelector('.kanban-add-btn').style.display = '';
            updateAllCounts();
          }
        }).catch(function (err) {
          console.error('Kanban create task failed:', err);
        }).finally(function () {
          btn.disabled = false;
        });
      });
    });
    var titleInputs = board.querySelectorAll('.kanban-input-title');
    titleInputs.forEach(function (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var addCard = input.closest('.kanban-add-card');
          var submitBtn = addCard.querySelector('.kanban-submit-btn');
          if (submitBtn) {
            submitBtn.click();
          }
        }
      });
    });
  }
  function initDeleteButtons() {
    board.addEventListener('click', function (e) {
      var deleteBtn = e.target.closest('.kanban-card-delete');
      if (!deleteBtn) {
        return;
      }
      var card = deleteBtn.closest('.kanban-card');
      var taskId = card.dataset.taskId;
      if (!window.confirm('Delete this task?')) {
        return;
      }
      card.style.opacity = '0.3';
      fetch(restUrl + 'telex-kanban/v1/delete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': restNonce
        },
        body: JSON.stringify({
          task_id: parseInt(taskId, 10)
        })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data.success) {
          card.remove();
          updateAllCounts();
        } else {
          card.style.opacity = '';
        }
      }).catch(function () {
        card.style.opacity = '';
      });
    });
  }
  function createCardElement(task) {
    var card = document.createElement('div');
    card.className = 'kanban-card';
    card.dataset.taskId = task.id;
    var html = '<div class="kanban-card-title">' + escapeHtml(task.title) + '</div>';
    if (task.description) {
      html += '<div class="kanban-card-desc">' + escapeHtml(task.description) + '</div>';
    }
    if (canEdit) {
      html += '<div class="kanban-card-actions">';
      html += '<button class="kanban-card-delete" aria-label="Delete task">\u00d7</button>';
      html += '</div>';
    }
    card.innerHTML = html;
    return card;
  }
  function resetForm(form) {
    var inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(function (input) {
      input.value = '';
    });
  }
  function updateAllCounts() {
    var columns = board.querySelectorAll('.kanban-column');
    columns.forEach(function (columnEl) {
      var cardCount = columnEl.querySelectorAll('.kanban-card').length;
      var countEl = columnEl.querySelector('.kanban-column-count');
      if (countEl) {
        countEl.textContent = cardCount;
      }
    });
  }
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
}
document.addEventListener('DOMContentLoaded', function () {
  var boards = document.querySelectorAll('.kanban-board[data-kanban-interactive]');
  boards.forEach(function (board) {
    initKanbanBoard(board);
  });
});
/******/ })()
;
//# sourceMappingURL=view.js.map