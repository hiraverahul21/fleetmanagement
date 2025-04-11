import React, { useState } from 'react';
import { Upload, message, Card, Table } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;

const UploadBill = () => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [vendorName, setVendorName] = useState('');

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
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
          }))
        ];
        setColumns(tableColumns);

        // Rest of the data processing remains the same
        const tableData = jsonData.slice(2).map((row, rowIndex) => {
          const rowData = { 
            key: rowIndex,
            vendorName: vendorNameValue
          };
          row.forEach((cell, cellIndex) => {
            rowData[`col${cellIndex}`] = cell;
          });
          return rowData;
        });
        setExcelData(tableData);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
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