const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Score = require('../models/Score');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const docx = require('docx');

// Helper function to generate PDF report
const generatePDFReport = async (studentId, semester, includeOptions) => {
    const doc = new PDFDocument();
    const student = await User.findById(studentId);
    const scores = await Score.find({ student: studentId })
        .populate('educator', 'firstName lastName')
        .sort({ semester: 1, subject: 1 });

    // Add header
    doc.fontSize(20).text('Academic Performance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Student: ${student.firstName} ${student.lastName}`);
    doc.text(`College ID: ${student.collegeId}`);
    doc.text(`Branch: ${student.branch}`);
    doc.moveDown();

    // Filter scores by semester if specified
    let filteredScores = scores;
    if (semester !== 'all') {
        filteredScores = scores.filter(score => score.semester === semester);
    }

    // Calculate CGPA and SGPA
    const semesterScores = {};
    filteredScores.forEach(score => {
        if (!semesterScores[score.semester]) {
            semesterScores[score.semester] = [];
        }
        semesterScores[score.semester].push(score);
    });

    const sgpaData = Object.keys(semesterScores).map(sem => {
        const semesterScore = semesterScores[sem];
        const totalScore = semesterScore.reduce((sum, score) => sum + score.score, 0);
        const sgpa = totalScore / semesterScore.length;
        return {
            semester: sem,
            sgpa: parseFloat(sgpa.toFixed(2))
        };
    });

    const totalSgpa = sgpaData.reduce((sum, item) => sum + item.sgpa, 0);
    const cgpa = sgpaData.length > 0 ? parseFloat((totalSgpa / sgpaData.length).toFixed(2)) : null;

    // Add academic summary
    doc.fontSize(16).text('Academic Summary');
    doc.moveDown();
    doc.fontSize(12).text(`CGPA: ${cgpa ? cgpa.toFixed(2) : 'N/A'}`);
    doc.moveDown();

    // Add semester-wise SGPA
    doc.fontSize(14).text('Semester-wise SGPA');
    doc.moveDown();
    sgpaData.forEach(item => {
        doc.text(`Semester ${item.semester}: ${item.sgpa.toFixed(2)}`);
    });
    doc.moveDown();

    // Add detailed scores if requested
    if (includeOptions.personalScores) {
        doc.fontSize(14).text('Detailed Scores');
        doc.moveDown();
        
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidth = 100;
        
        // Table headers
        doc.fontSize(10)
            .text('Semester', tableLeft, tableTop)
            .text('Subject', tableLeft + colWidth, tableTop)
            .text('Score', tableLeft + colWidth * 2, tableTop)
            .text('Educator', tableLeft + colWidth * 3, tableTop);
        
        // Table rows
        let y = tableTop + 20;
        filteredScores.forEach(score => {
            doc.text(score.semester.toString(), tableLeft, y)
                .text(score.subject, tableLeft + colWidth, y)
                .text(score.score.toString(), tableLeft + colWidth * 2, y)
                .text(`${score.educator.firstName} ${score.educator.lastName}`, tableLeft + colWidth * 3, y);
            y += 20;
        });
    }

    return doc;
};

// Helper function to generate Excel report
const generateExcelReport = async (studentId, semester, includeOptions) => {
    const workbook = new ExcelJS.Workbook();
    const student = await User.findById(studentId);
    const scores = await Score.find({ student: studentId })
        .populate('educator', 'firstName lastName')
        .sort({ semester: 1, subject: 1 });

    // Create a worksheet
    const worksheet = workbook.addWorksheet('Academic Report');

    // Add header
    worksheet.addRow(['Academic Performance Report']);
    worksheet.addRow([`Student: ${student.firstName} ${student.lastName}`]);
    worksheet.addRow([`College ID: ${student.collegeId}`]);
    worksheet.addRow([`Branch: ${student.branch}`]);
    worksheet.addRow([]);

    // Filter scores by semester if specified
    let filteredScores = scores;
    if (semester !== 'all') {
        filteredScores = scores.filter(score => score.semester === semester);
    }

    // Calculate CGPA and SGPA
    const semesterScores = {};
    filteredScores.forEach(score => {
        if (!semesterScores[score.semester]) {
            semesterScores[score.semester] = [];
        }
        semesterScores[score.semester].push(score);
    });

    const sgpaData = Object.keys(semesterScores).map(sem => {
        const semesterScore = semesterScores[sem];
        const totalScore = semesterScore.reduce((sum, score) => sum + score.score, 0);
        const sgpa = totalScore / semesterScore.length;
        return {
            semester: sem,
            sgpa: parseFloat(sgpa.toFixed(2))
        };
    });

    const totalSgpa = sgpaData.reduce((sum, item) => sum + item.sgpa, 0);
    const cgpa = sgpaData.length > 0 ? parseFloat((totalSgpa / sgpaData.length).toFixed(2)) : null;

    // Add academic summary
    worksheet.addRow(['Academic Summary']);
    worksheet.addRow([`CGPA: ${cgpa ? cgpa.toFixed(2) : 'N/A'}`]);
    worksheet.addRow([]);

    // Add semester-wise SGPA
    worksheet.addRow(['Semester-wise SGPA']);
    sgpaData.forEach(item => {
        worksheet.addRow([`Semester ${item.semester}: ${item.sgpa.toFixed(2)}`]);
    });
    worksheet.addRow([]);

    // Add detailed scores if requested
    if (includeOptions.personalScores) {
        worksheet.addRow(['Detailed Scores']);
        worksheet.addRow(['Semester', 'Subject', 'Score', 'Educator']);
        
        filteredScores.forEach(score => {
            worksheet.addRow([
                score.semester,
                score.subject,
                score.score,
                `${score.educator.firstName} ${score.educator.lastName}`
            ]);
        });
    }

    return workbook;
};

// Helper function to generate Word report
const generateWordReport = async (studentId, semester, includeOptions) => {
    const student = await User.findById(studentId);
    const scores = await Score.find({ student: studentId })
        .populate('educator', 'firstName lastName')
        .sort({ semester: 1, subject: 1 });

    // Create a new document
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    text: 'Academic Performance Report',
                    heading: docx.HeadingLevel.HEADING_1,
                    alignment: docx.AlignmentType.CENTER,
                }),
                new docx.Paragraph({
                    text: `Student: ${student.firstName} ${student.lastName}`,
                }),
                new docx.Paragraph({
                    text: `College ID: ${student.collegeId}`,
                }),
                new docx.Paragraph({
                    text: `Branch: ${student.branch}`,
                }),
                new docx.Paragraph({}),
            ],
        }],
    });

    // Filter scores by semester if specified
    let filteredScores = scores;
    if (semester !== 'all') {
        filteredScores = scores.filter(score => score.semester === semester);
    }

    // Calculate CGPA and SGPA
    const semesterScores = {};
    filteredScores.forEach(score => {
        if (!semesterScores[score.semester]) {
            semesterScores[score.semester] = [];
        }
        semesterScores[score.semester].push(score);
    });

    const sgpaData = Object.keys(semesterScores).map(sem => {
        const semesterScore = semesterScores[sem];
        const totalScore = semesterScore.reduce((sum, score) => sum + score.score, 0);
        const sgpa = totalScore / semesterScore.length;
        return {
            semester: sem,
            sgpa: parseFloat(sgpa.toFixed(2))
        };
    });

    const totalSgpa = sgpaData.reduce((sum, item) => sum + item.sgpa, 0);
    const cgpa = sgpaData.length > 0 ? parseFloat((totalSgpa / sgpaData.length).toFixed(2)) : null;

    // Add academic summary
    doc.addSection({
        children: [
            new docx.Paragraph({
                text: 'Academic Summary',
                heading: docx.HeadingLevel.HEADING_2,
            }),
            new docx.Paragraph({
                text: `CGPA: ${cgpa ? cgpa.toFixed(2) : 'N/A'}`,
            }),
            new docx.Paragraph({}),
            new docx.Paragraph({
                text: 'Semester-wise SGPA',
                heading: docx.HeadingLevel.HEADING_2,
            }),
        ],
    });

    // Add semester-wise SGPA
    sgpaData.forEach(item => {
        doc.addParagraph(new docx.Paragraph({
            text: `Semester ${item.semester}: ${item.sgpa.toFixed(2)}`,
        }));
    });

    doc.addParagraph(new docx.Paragraph({}));

    // Add detailed scores if requested
    if (includeOptions.personalScores) {
        doc.addParagraph(new docx.Paragraph({
            text: 'Detailed Scores',
            heading: docx.HeadingLevel.HEADING_2,
        }));

        // Create a table
        const table = new docx.Table({
            width: {
                size: 100,
                type: docx.WidthType.PERCENTAGE,
            },
            rows: [
                new docx.TableRow({
                    children: [
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Semester' })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Subject' })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Score' })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: 'Educator' })],
                        }),
                    ],
                }),
            ],
        });

        // Add rows to the table
        filteredScores.forEach(score => {
            table.addRow(
                new docx.TableRow({
                    children: [
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: score.semester.toString() })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: score.subject })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: score.score.toString() })],
                        }),
                        new docx.TableCell({
                            children: [new docx.Paragraph({ text: `${score.educator.firstName} ${score.educator.lastName}` })],
                        }),
                    ],
                })
            );
        });

        doc.addTable(table);
    }

    return doc;
};

// Export report endpoint
router.post('/export', (req, res, next) => {
    auth(req, res, async () => {
        try {
            const { studentId, semester, format, includeOptions } = req.body;

            // Check if the requesting user is the student or an educator
            if (req.user.role !== 'educator' && req.user._id.toString() !== studentId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            let report;
            let contentType;
            let extension;

            switch (format) {
                case 'pdf':
                    report = await generatePDFReport(studentId, semester, includeOptions);
                    contentType = 'application/pdf';
                    extension = 'pdf';
                    break;
                case 'excel':
                    report = await generateExcelReport(studentId, semester, includeOptions);
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                    break;
                case 'doc':
                    report = await generateWordReport(studentId, semester, includeOptions);
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    extension = 'docx';
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid format specified' });
            }

            // Set response headers
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename=academic_report_${semester}.${extension}`);

            // Send the report
            if (format === 'pdf') {
                report.pipe(res);
            } else if (format === 'excel') {
                await report.xlsx.write(res);
            } else if (format === 'doc') {
                const buffer = await docx.Packer.toBuffer(report);
                res.send(buffer);
            }
        } catch (err) {
            console.error('Error generating report:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

module.exports = router; 