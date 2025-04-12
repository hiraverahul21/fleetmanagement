import React, { useState, useEffect } from 'react';
import { Upload, message, Card, Table } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const { Dragger } = Upload;

const UploadBill = () => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [vendorName, setVendorName] = useState('');

  const fetchDieselDetails = async (slipNumber) => {
    try {
      console.log('Fetching details for slip:', slipNumber);
      const response = await axios.get(`/api/diesel/slip-details/${slipNumber}`);
      console.log('Response:', response.data);
      if (response.data && response.data.success) {
        return {
          qtyTaken: response.data.data.dieselQty,
          vehicleNo: response.data.data.vehicleNo
        };
      }
      message.warning(`No details found for slip number: ${slipNumber}`);
      return null;
    } catch (error) {
      console.error('Error fetching diesel details:', error);
      message.error(`Failed to fetch details for slip: ${slipNumber}`);
      return null;
    }
  };

  const processExcelRow = async (row, columnIndex) => {
    const slipValue = row[columnIndex];
    const qtyFromBill = parseFloat(row[columnIndex + 1] || 0); // Assuming Qty is in next column
    console.log('Processing slip value:', slipValue, 'at column:', columnIndex);
    if (slipValue) {
      const dieselDetails = await fetchDieselDetails(slipValue);
      if (dieselDetails) {
        const qtyTaken = parseFloat(dieselDetails.qtyTaken || 0);
        let recoStatus = '';
        let statusStyle = {};

        if (qtyFromBill > qtyTaken) {
          recoStatus = 'Qty Issued Exceed';
          statusStyle = { color: 'red' };
        } else if (qtyFromBill < qtyTaken) {
          recoStatus = 'Qty Issued Less';
          statusStyle = { color: 'green' };
        } else {
          recoStatus = 'Success';
          statusStyle = { fontWeight: 'bold' };
        }

        return {
          slipGivenTo: dieselDetails.vehicleNo,
          qtyTaken: dieselDetails.qtyTaken,
          recoStatus,
          statusStyle
        };
      }
      return {
        slipGivenTo: 'Not Found',
        qtyTaken: 'Not Found',
        recoStatus: 'Fail',
        statusStyle: { color: 'red' }
      };
    }
    return { slipGivenTo: '', qtyTaken: '', recoStatus: '', statusStyle: {} };
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const vendorCell = firstSheet['A1'];
      const vendorNameValue = vendorCell ? vendorCell.v : '';
      setVendorName(vendorNameValue);

      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length > 1) {
        // Calculate max width for each column
        const columnWidths = new Array(jsonData[1].length).fill(0);
        jsonData.slice(2).forEach(row => {
          row.forEach((cell, index) => {
            const cellLength = String(cell).length * 8; // Approximate pixel width
            columnWidths[index] = Math.max(columnWidths[index], cellLength);
          });
        });

        // Create columns with calculated widths
        const tableColumns = [
          {
            title: 'Vendor Name',
            dataIndex: 'vendorName',
            key: 'vendorName',
            fixed: 'left',
            width: Math.max(150, vendorNameValue.length * 8)
          },
          ...jsonData[1].map((col, index) => ({
            title: col || `Column ${index + 1}`,
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: Math.max(100, columnWidths[index], String(col).length * 8)
          })),
          {
            title: 'Slip Given To',
            dataIndex: 'slipGivenTo',
            key: 'slipGivenTo',
            width: 150,
            render: (text, record) => (
              <input
                type="text"
                value={text || ''}
                onChange={(e) => handleInputChange(record.key, 'slipGivenTo', e.target.value)}
                style={{ width: '100%' }}
              />
            )
          },
          {
            title: 'Qty Taken',
            dataIndex: 'qtyTaken',
            key: 'qtyTaken',
            width: 100,
            render: (text, record) => (
              <input
                type="number"
                value={text || ''}
                onChange={(e) => handleInputChange(record.key, 'qtyTaken', e.target.value)}
                style={{ width: '100%' }}
              />
            )
          },
          {
            title: 'Reco Status',
            dataIndex: 'recoStatus',
            key: 'recoStatus',
            width: 120,
            render: (text, record) => (
              <span style={record.statusStyle}>
                {text || ''}
              </span>
            )
          },
          {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            width: 200,
            render: (text, record) => (
              <input
                type="text"
                value={text || ''}
                onChange={(e) => handleInputChange(record.key, 'remarks', e.target.value)}
                style={{ width: '100%' }}
              />
            )
          }
        ];

        // Find the slip column index
        const slipColumnIndex = jsonData[1].findIndex(col => 
          col.toLowerCase().includes('slip')
        );

        // Process data with diesel details
        const tableData = await Promise.all(jsonData.slice(2).map(async (row, rowIndex) => {
          const dieselInfo = await processExcelRow(row, slipColumnIndex);
          const rowData = { 
            key: rowIndex,
            vendorName: vendorNameValue,
            ...dieselInfo,
            remarks: ''
          };
          row.forEach((cell, cellIndex) => {
            rowData[`col${cellIndex}`] = cell;
          });
          return rowData;
        }));

        setColumns(tableColumns);
        setExcelData(tableData);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleInputChange = (key, field, value) => {
    setExcelData(prev => 
      prev.map(row => 
        row.key === key ? { ...row, [field]: value } : row
      )
    );
  };

  const props = {
    name: 'file',
    multiple: false,
    accept: '.xlsx, .xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('You can only upload Excel files!');
        return false;
      }
      handleFile(file);
      return false;
    },
  };

  return (
    <Card title="Upload Diesel Bill" style={{ margin: '24px' }}>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single Excel file upload. Please ensure the file contains valid diesel bill data.
        </p>
      </Dragger>

      {excelData.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Excel Data Preview</h3>
          <Table 
            columns={columns} 
            dataSource={excelData}
            scroll={{ x: 'max-content', y: 500 }}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      )}
    </Card>
  );
};

export default UploadBill;