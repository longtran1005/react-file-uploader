import React, { Fragment, useState, useEffect } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';

const FileUpload = () => {
  const [file, setFile] = useState([]);
  const [filename, setFilename] = useState([]);
  const [fileSize, setFileSize] = useState([]);
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  useEffect(() => console.log(filename), [filename]);

  const onChange = e => {
    var fileInput = false;
    if(e.target.files.length > 0) {
      fileInput = true
    }
    if(fileInput) {
      for (var i in e.target.files) {
        if(!isNaN(i)) {
          console.log(i);
          Resizer.imageFileResizer(
            e.target.files[i],
            3000,
            3000,
            'JPEG',
            90,
            0,
            uri => {
              setFileSize([...fileSize,uri]);
            },
            'base64'
        );
        setFile([...file,e.target.files[i]]);
        setFilename([...filename,e.target.files[i].name]);
        }
      }
    }
  };
  const removeFile = e => {
    console.log('removefile');
    setFile([]);
    setFilename([]);
    setFileSize([]);
  }
  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );

          // Clear percentage
          // setTimeout(() => setUploadPercentage(0), 10000);
        }
      });

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });

      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage(`There was a problem with the server: ${JSON.stringify(err)}`);
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };

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
            {filename}
          </label>
        </div>
        {
          fileSize.map( f => {
            return (
              <img key={f} style={{ width: '50px', height:'50px', margin:'10px' }} src={f} onClick={removeFile} alt="" />
            )
          })

        }
        {/* <div>File: <img style={{ width: '100%' }} src={fileSize} onClick={removeFile} alt="" /> </div> */}

        <Progress percentage={uploadPercentage} />
        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
      </form>
      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3 className='text-center'>{uploadedFile.fileName}</h3>
            <img style={{ width: '100%' }} src={uploadedFile.filePath} alt='' />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;
