import UI from '../UI';
import initColorPicker from './initColorPicker';


export default function initToolbarEvents(RENDER_OPTIONS) {
  // Text stuff
  (function () {
    var textSize = void 0;
    var textColor = void 0;

    function initText() {
      var size = document.querySelector('.toolbar .text-size');
      [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96].forEach(function (s) {
        size.appendChild(new Option(s, s));
      });

      setText(localStorage.getItem(RENDER_OPTIONS.documentId + '/text/size') || 10, localStorage.getItem(RENDER_OPTIONS.documentId + '/text/color') || '#000000');

      initColorPicker(document.querySelector('.text-color'), textColor, function (value) {
        setText(textSize, value);
      });
    }

    function setText(size, color) {
      var modified = false;

      if (textSize !== size) {
        modified = true;
        textSize = size;
        localStorage.setItem(RENDER_OPTIONS.documentId + '/text/size', textSize);
        document.querySelector('.toolbar .text-size').value = textSize;
      }

      if (textColor !== color) {
        modified = true;
        textColor = color;
        localStorage.setItem(RENDER_OPTIONS.documentId + '/text/color', textColor);

        var selected = document.querySelector('.toolbar .text-color.color-selected');
        if (selected) {
          selected.classList.remove('color-selected');
          selected.removeAttribute('aria-selected');
        }

        selected = document.querySelector('.toolbar .text-color[data-color="' + color + '"]');
        if (selected) {
          selected.classList.add('color-selected');
          selected.setAttribute('aria-selected', true);
        }
      }

      if (modified) {
        UI.setText(textSize, textColor);
      }
    }

    function handleTextSizeChange(e) {
      setText(e.target.value, textColor);
    }

    document.querySelector('.toolbar .text-size').addEventListener('change', handleTextSizeChange);

    initText();
  })();

  // Pen stuff
  (function () {
    var penSize = void 0;
    var penColor = void 0;

    function initPen() {
      var size = document.querySelector('.toolbar .pen-size');
      for (var i = 0; i < 20; i++) {
        size.appendChild(new Option(i + 1, i + 1));
      }

      setPen(localStorage.getItem(RENDER_OPTIONS.documentId + '/pen/size') || 1, localStorage.getItem(RENDER_OPTIONS.documentId + '/pen/color') || '#000000');

      initColorPicker(document.querySelector('.pen-color'), penColor, function (value) {
        setPen(penSize, value);
      });
    }

    function setPen(size, color) {
      var modified = false;

      if (penSize !== size) {
        modified = true;
        penSize = size;
        localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/size', penSize);
        document.querySelector('.toolbar .pen-size').value = penSize;
      }

      if (penColor !== color) {
        modified = true;
        penColor = color;
        localStorage.setItem(RENDER_OPTIONS.documentId + '/pen/color', penColor);

        var selected = document.querySelector('.toolbar .pen-color.color-selected');
        if (selected) {
          selected.classList.remove('color-selected');
          selected.removeAttribute('aria-selected');
        }

        selected = document.querySelector('.toolbar .pen-color[data-color="' + color + '"]');
        if (selected) {
          selected.classList.add('color-selected');
          selected.setAttribute('aria-selected', true);
        }
      }

      if (modified) {
        UI.setPen(penSize, penColor);
      }
    }

    function handlePenSizeChange(e) {
      setPen(e.target.value, penColor);
    }

    document.querySelector('.toolbar .pen-size').addEventListener('change', handlePenSizeChange);

    initPen();
  })();

  // Toolbar buttons
  (function () {
    var tooltype = localStorage.getItem(RENDER_OPTIONS.documentId + '/tooltype') || 'cursor';
    if (tooltype) {
      setActiveToolbarItem(tooltype, document.querySelector('.toolbar button[data-tooltype=' + tooltype + ']'));
    }

    function setActiveToolbarItem(type, button) {
      var active = document.querySelector('.toolbar button.active');
      if (active) {
        active.classList.remove('active');

        switch (tooltype) {
          case 'cursor':
            UI.disableEdit();
            break;
          case 'draw':
            UI.disablePen();
            break;
          case 'text':
            UI.disableText();
            break;
          case 'point':
            UI.disablePoint();
            break;
          case 'area':
          case 'highlight':
          case 'strikeout':
            UI.disableRect();
            break;
        }
      }

      if (button) {
        button.classList.add('active');
      }
      if (tooltype !== type) {
        localStorage.setItem(RENDER_OPTIONS.documentId + '/tooltype', type);
      }
      tooltype = type;

      switch (type) {
        case 'cursor':
          UI.enableEdit();
          break;
        case 'draw':
          UI.enablePen();
          break;
        case 'text':
          UI.enableText();
          break;
        case 'point':
          UI.enablePoint();
          break;
        case 'area':
        case 'highlight':
        case 'strikeout':
          UI.enableRect(type);
          break;
      }
    }

    function handleToolbarClick(e) {
      if (e.target.nodeName === 'BUTTON') {
        setActiveToolbarItem(e.target.getAttribute('data-tooltype'), e.target);
      }
    }

    document.querySelector('.toolbar').addEventListener('click', handleToolbarClick);
  })();

  // Scale/rotate
  (function () {
    function setScaleRotate(scale, rotate) {
      scale = parseFloat(scale, 10);
      rotate = parseInt(rotate, 10);

      if (RENDER_OPTIONS.scale !== scale || RENDER_OPTIONS.rotate !== rotate) {
        RENDER_OPTIONS.scale = scale;
        RENDER_OPTIONS.rotate = rotate;

        localStorage.setItem(RENDER_OPTIONS.documentId + '/scale', RENDER_OPTIONS.scale);
        localStorage.setItem(RENDER_OPTIONS.documentId + '/rotate', RENDER_OPTIONS.rotate % 360);

        render();
      }
    }

    function handleScaleChange(e) {
      setScaleRotate(e.target.value, RENDER_OPTIONS.rotate);
    }

    function handleRotateCWClick() {
      setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate + 90);
    }

    function handleRotateCCWClick() {
      setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate - 90);
    }

    document.querySelector('.toolbar select.scale').value = RENDER_OPTIONS.scale;
    document.querySelector('.toolbar select.scale').addEventListener('change', handleScaleChange);
    document.querySelector('.toolbar .rotate-ccw').addEventListener('click', handleRotateCCWClick);
    document.querySelector('.toolbar .rotate-cw').addEventListener('click', handleRotateCWClick);
  })();

  // Clear toolbar button
  (function () {
    function handleClearClick(e) {
      if (confirm('Are you sure you want to clear annotations?')) {
        for (var i = 0; i < NUM_PAGES; i++) {
          document.querySelector('div#pageContainer' + (i + 1) + ' svg.annotationLayer').innerHTML = '';
        }

        localStorage.removeItem(RENDER_OPTIONS.documentId + '/annotations');
      }
    }

    document.querySelector('a.clear').addEventListener('click', handleClearClick);
  })();

  // Comment stuff
  (function (window, document) {
    var commentList = document.querySelector('#comment-wrapper .comment-list-container');
    var commentForm = document.querySelector('#comment-wrapper .comment-list-form');
    var commentText = commentForm.querySelector('input[type="text"]');

    function supportsComments(target) {
      var type = target.getAttribute('data-pdf-annotate-type');
      return ['point', 'highlight', 'area'].indexOf(type) > -1;
    }

    function insertComment(comment) {
      var child = document.createElement('div');
      child.className = 'comment-list-item';
      child.innerHTML = _twitterText2.default.autoLink(_twitterText2.default.htmlEscape(comment.content));

      commentList.appendChild(child);
    }

    function handleAnnotationClick(target) {
      if (supportsComments(target)) {
        (function () {
          var documentId = target.parentNode.getAttribute('data-pdf-annotate-document');
          var annotationId = target.getAttribute('data-pdf-annotate-id');

          _2.default.getStoreAdapter().getComments(documentId, annotationId).then(function (comments) {
            commentList.innerHTML = '';
            commentForm.style.display = '';
            commentText.focus();

            commentForm.onsubmit = function () {
              _2.default.getStoreAdapter().addComment(documentId, annotationId, commentText.value.trim()).then(insertComment).then(function () {
                commentText.value = '';
                commentText.focus();
              });

              return false;
            };

            comments.forEach(insertComment);
          });
        })();
      }
    }

    function handleAnnotationBlur(target) {
      if (supportsComments(target)) {
        commentList.innerHTML = '';
        commentForm.style.display = 'none';
        commentForm.onsubmit = null;

        insertComment({content: 'No comments'});
      }
    }

    UI.addEventListener('annotation:click', handleAnnotationClick);
    UI.addEventListener('annotation:blur', handleAnnotationBlur);
  });//(window, document);
}