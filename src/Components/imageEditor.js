import React, { useState } from 'react';
import './ImageEditor.css';
import Image1 from './image1.jpg';
import Image2 from './image2.jpg';
import Image3 from './image3.jpg';
import Image4 from './image4.jpg';
// /////////////////////////////////////////////////////////////////////////////////
// Image editor component                                                    //////
// ////////////////////////////////////////////////////////////////////////////////
const ImageEditor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [editedElement, setEditedElement] = useState(null);
  const [editedText, setEditedText] = useState('');

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setSelectedText(null);
  };

  const handleTextSelect = (text) => {
    setSelectedText(text);
    setSelectedImage(null);
  };

  const handleCanvasDrop = (event) => {
    event.preventDefault();
    const element = event.dataTransfer.getData('element');
    const positionX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const positionY = event.clientY - event.currentTarget.getBoundingClientRect().top;

    if (element === 'image' && selectedImage) {
      const newImage = {
        type: 'image',
        image: selectedImage,
        positionX,
        positionY,
        size: '100%',
      };
      setCanvasElements([...canvasElements, newImage]);
    } else if (element === 'text' && selectedText) {
      const newText = {
        type: 'text',
        text: selectedText,
        positionX,
        positionY,
      };
      setCanvasElements([...canvasElements, newText]);
    }
  };

  const handleCanvasDelete = (index) => {
    const updatedElements = [...canvasElements];
    updatedElements.splice(index, 1);
    setCanvasElements(updatedElements);
  };


  const handleEdit = (elementIndex, event) => {
    const element = canvasElements[elementIndex];
    setEditedElement(element);
    if (element.type === 'text') {
      setEditedText(element.text);
    } else {
      handleModalSave(); // Save the changes immediately for images
    }
  };
  


  const handleSave = () => {
    // Save the canvas elements to local storage
    var element = JSON.stringify(canvasElements);
    localStorage.setItem('canvasElements', element);
    alert("your work is saved sucessfully.")
  };

  const handleModalClose = () => {
    setEditedElement(null);
    setEditedText('');
  };

  const handleModalSave = () => {
    if (editedElement) {
      // Update the edited element with new properties
      const updatedElements = [...canvasElements];
      const index = canvasElements.findIndex((element) => element === editedElement);
      if (editedElement.type === 'text') {
        updatedElements[index].text = editedText;
      }
      setCanvasElements(updatedElements);
    }
    handleModalClose();
  };

  const handleModalInputChange = (event) => {
    const value = event.target.value;
    setEditedText(value);
  };

  return (
    <div className="image-editor-container">
      <div className="sidebar">
        <ImageComponent onImageSelect={handleImageSelect} />
        <TextComponent onTextSelect={handleTextSelect} />
      </div>
      <div
        className="canvas"
        onDrop={handleCanvasDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        {canvasElements.map((element, index) => (
          <CanvasElement
            key={index}
            element={element}
            onDelete={() => handleCanvasDelete(index)}
            onEdit={(event) => handleEdit(index, event)}
          />
        ))}
      </div>
      <button onClick={handleSave} className="saveButton">
        Save
      </button>
    </div>
  );
};
/////////////////////////////////////////////////////////////////////////////
// Image component                                                    ///////
/////////////////////////////////////////////////////////////////////////////
const ImageComponent = ({ onImageSelect }) => {
  const images = [Image1, Image2, Image3, Image4];

  const handleImageSelect = (image) => {
    onImageSelect(image);
  };

  return (
    <div className="component">
      <h2>Image Component</h2>
      <div className="image-component-container">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            draggable
            className="sidebar-image"
            onDragStart={(event) => {
              event.dataTransfer.setData('element', 'image');
              handleImageSelect(image);
            }}
          />
        ))}
      </div>
    </div>
  );
};
// ////////////////////////////////////////////////////////////////////////
//TEXT component                                                    ///////
// ////////////////////////////////////////////////////////////////////////
const TextComponent = ({ onTextSelect }) => {
  const texts = ['Text 1', 'Text 2', 'Text 3', 'Text 4'];

  const handleTextSelect = (text) => {
    onTextSelect(text);
  };

  return (
    <div className="component">
      <h2>Text Component</h2>
      {texts.map((text, index) => (
        <div
          key={index}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('element', 'text');
            handleTextSelect(text);
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
};
////////////////////////////////////////////////////////////////////////////
// CANVAS Component                                                    /////
////////////////////////////////////////////////////////////////////////////
const CanvasElement = ({ element, onDelete, onEdit }) => {
  const handleDelete = () => {
    onDelete();
  };

  const handleEdit = (event) => {
    if (event.detail === 2) {
      onEdit();
    }
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData('element', 'image');
    event.dataTransfer.setData('image', element.image);
    event.dataTransfer.setData('positionX', element.positionX);
    event.dataTransfer.setData('positionY', element.positionY);
  };

  const handleResize = (event, direction) => {
    event.stopPropagation();
    
    const resizeAmount = 10; // Adjust this value to control the resize increment
    
    const image = event.target.parentNode.querySelector('img');
    const currentWidth = image.offsetWidth;
    const currentHeight = image.offsetHeight;
  
    let newWidth = currentWidth;
    let newHeight = currentHeight;
  
    if (direction === 'top-left' || direction === 'top-right') {
      newHeight -= resizeAmount;
    } else {
      newHeight += resizeAmount;
    }
  
    if (direction === 'top-left' || direction === 'bottom-left') {
      newWidth -= resizeAmount;
    } else {
      newWidth += resizeAmount;
    }
  
    image.style.width = `${newWidth}px`;
    image.style.height = `${newHeight}px`;
  };
  

  return (
    <div
      className="canvas-element"
      style={{ left: element.positionX, top: element.positionY }}
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={element.type === 'text' ? handleEdit : null} // Enable double-click editing for text
    >
      {element.type === 'image' && (
        <div>
          <img
            src={element.image}
            alt="Canvas Image"
            style={{ width: element.size }}
            onDoubleClick={handleEdit} // Enable double-click editing for images
          />
          <div className="resize-handle top-left" onMouseDown={(event) => handleResize(event, 'top-left')}></div>
          <div className="resize-handle top-right" onMouseDown={(event) => handleResize(event, 'top-right')}></div>
          <div className="resize-handle bottom-left" onMouseDown={(event) => handleResize(event, 'bottom-left')}></div>
          <div className="resize-handle bottom-right" onMouseDown={(event) => handleResize(event, 'bottom-right')}></div>
        </div>
      )}
      {element.type === 'text' && (
        <div
          contentEditable={true}
          suppressContentEditableWarning={true}
          onDoubleClick={handleEdit}
        >
          {element.text}
        </div>
      )}
      <div className="canvas-element-actions">
        <button className="deleteButton" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};



export default ImageEditor;
