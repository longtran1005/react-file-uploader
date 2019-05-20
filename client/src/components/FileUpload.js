import React, { Fragment, useState, useEffect } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';

const FileUpload = () => {

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => console.log(fileInfos), [fileInfos]);

  const onChange = e => {
    var fileInput = false;
    if (e.target.files.length > 0) {
      fileInput = true
    }
    if (fileInput) {
      for (var i in e.target.files) {
        if (!isNaN(i)) {
          let currentFile = e.target.files[i];
          let currentFileName = e.target.files[i].name;
          Resizer.imageFileResizer(
            e.target.files[i],
            3000,
            3000,
            'JPEG',
            90,
            0,
            uri => {
              let fileInfo =
              {
                file: currentFile,
                fileName: currentFileName,
                fileURI: uri
              }
              setFileInfos(fileInfos => [...fileInfos, fileInfo]);
            },
            'base64'
          );
        }
      }
    }
  };
  const removeFile = (fileURI) => {
    setFileInfos(fileInfos => fileInfos.filter(f => f.fileURI !== fileURI));
  }
  const onSubmit = async e => {
    e.preventDefault();
    console.log('jump here');
    const uploaders = fileInfos.map(file => {
      // Initial FormData
      const formData = new FormData();
      formData.append("file", file.file);
  
      return axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          // setUploadPercentage(
          //   parseInt(
          //     Math.round((progressEvent.loaded * 100) / progressEvent.total)
          //   )
          // );
        }
      }).then(response => {
        let { fileName, filePath } = response.data;
        setUploadedFiles(uploadedFiles => [...uploadedFiles, { fileName, filePath }]);
      }).catch(error => {
        if (error.response.status === 500) {
          setMessage(`There was a problem with the server: ${JSON.stringify(error)}`);
        } else {
          setMessage(error.response.data.msg);
        }
      });
    });
    axios.all(uploaders).then(() => {
      // ... perform after upload is successful operation
      setMessage('All files uploaded');
    });
  };
  // Push all the axios request promise into a single array 

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='customFile'
            accept='image/*'
            multiple
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {/* {file.name} */}
          </label>
        </div>
        {
          fileInfos.map((f, i) => {
            return (
              <div key={i}>
                <div className="image-area">
                  <img src={f.fileURI} alt="" style={{ width: '80px', height: '80px', margin: '10px', display: 'inline-block' }} />
                  <a className="remove-image" onClick={() => removeFile(f.fileURI)} href="#">&#215;</a>
                </div>
                <Progress percentage={uploadPercentage} />
              </div>
            )
          })
        }
        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
      </form>
      {uploadedFiles ?
        uploadedFiles.map((u, i) => {
          return (
            <div className='row mt-5'>
              <div className='col-md-6 m-auto'>
                <h3 className='text-center'>{u.fileName}</h3>
                <img style={{ width: '100%' }} src={u.filePath} alt='' />
              </div>
            </div>
          )
        }) : null}

    </Fragment>
  );
};

export default FileUpload;
