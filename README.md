# Arbeitsplan - Shift Planning and Management System

Arbeitsplan is a comprehensive shift planning and management system built with Next.js and TypeScript. It helps businesses efficiently manage employee schedules, track working hours, and generate detailed reports.

## Features

### 1. Shift Management
- Create, edit, and delete shifts
- Flexible shift scheduling with customizable time slots
- Drag-and-drop calendar interface
- Automatic working hours calculation

### 2. Employee Management
- Maintain employee records
- Track employee availability
- Assign shifts to employees
- Monitor individual working hours

### 3. Store Management
- Multi-store support
- Store-specific shift planning
- Individual store reports

### 4. Reporting and Analytics
- Monthly working hours reports
- Store-wise shift distribution
- Employee workload analysis
- Export reports to Excel

### 5. User Interface
- Modern, responsive design
- Intuitive calendar view
- Easy-to-use forms and modals
- Real-time updates

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arbeitsplan.git
cd arbeitsplan
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
arbeitsplan/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/         # Reusable React components
│   ├── lib/               # Utilities and services
│   └── types/             # TypeScript type definitions
├── public/               # Static assets
└── package.json         # Project dependencies and scripts
```

## Key Components

### Shift Assignment
- `ShiftAssignmentModal`: Modal for assigning shifts to employees
- `WorkplanForm`: Form for creating and editing shifts
- Calendar integration with drag-and-drop functionality

### Reporting
- Monthly hours calculation
- Excel export functionality
- Detailed analytics views

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
