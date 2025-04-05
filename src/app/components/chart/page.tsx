'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import '@/styles/chart.scss'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
// import { Auth } from '@/types/auth'
import { ChartData } from '@/types/chart/interface'
import LoginForm from '@/app/components/login/page'
import { Patient } from '@/types/patient';

// Đăng ký các components cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Định nghĩa kiểu dữ liệu

export default function ChartPage() {
  const router = useRouter();
  const [chartType, setChartType] = useState('bar')
  // @ts-nocheck
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [hasFile, setHasFile] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { data: session } = useSession() as { data: Session | null }

  const auth = session?.user
    ? {
        isAuth: true,
        id: session.user.id ?? null,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : { isAuth: false, name: null, email: null, image: null, id: null }

  const renderChart = () => {
    if (!chartData) return null

    // Cập nhật options cho Pie và Doughnut chart
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            boxWidth: 15,
            padding: 15,
            font: {
              size: 12,
            },
            color: 'rgba(75, 192, 192, 1)',
            generateLabels: (chart: any) => {
              // const datasets = chart.data.datasets;
              return chart.data.labels.map((label: string, i: number) => ({
                text: label.length > 20 ? label.substr(0, 20) + '...' : label,
                fillStyle: 'rgba(75, 192, 192, 0.2)',
                strokeStyle: 'rgba(75, 192, 192, 1)',
                lineWidth: 1,
                hidden: false,
                index: i,
                datasetIndex: 0,
                fullText: label,
              }))
            },
          },
          onClick: (e: any, legendItem: any, legend: any) => {
            const index = legendItem.index
            const ci = legend.chart
            if (ci.isDatasetVisible(0)) {
              ci.hide(0, index)
            } else {
              ci.show(0, index)
            }
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || ''
              const value = context.formattedValue
              return `${label}: ${value}`
            },
          },
        },
      },
      layout: {
        padding: {
          right: 100,
        },
      },
    }

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} />
      case 'line':
        return <Line data={chartData} />
      case 'pie':
        return (
          <div className="pie-chart-container">
            <Pie data={chartData} options={pieOptions} />
          </div>
        )
      case 'doughnut':
        return (
          <div className="pie-chart-container">
            <Doughnut data={chartData} options={pieOptions} />
          </div>
        )
      default:
        return null
    }
  }

  const [selectedChartType, setSelectedChartType] = useState('bar')
  const [showChart, setShowChart] = useState(false)
  const [originalChartData, setOriginalChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (!auth.isAuth) {
      router.push('/');
    }
  }, [auth.isAuth, router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset filter values
    setDateTimeRange({
      startDate: '',
      startTime: '00:00:00',
      endDate: '',
      endTime: '23:59:59',
    })

    // Reset no data message
    setNoDataMessage('')

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/chart', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to process file')
      const data = await response.json()

      setOriginalChartData(data)
      setChartData(data)
      setHasFile(true)
      setSelectedFileName(file.name)
      setSelectedChartType('bar')
      setShowChart(false)
    } catch (error) {
      console.error('Error processing file:', error)
      // Handle error...
    } finally {
      setIsLoading(false)
    }
  }

  const handleAPIData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/chart')
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()

      setChartData(data)
      setHasFile(true)
      setSelectedFileName('Data from API')
      setSelectedChartType('bar')
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChart = () => {
    setChartType(selectedChartType)
    setShowChart(true)
  }

  const [dateTimeRange, setDateTimeRange] = useState({
    startDate: '',
    startTime: '00:00:00',
    endDate: '',
    endTime: '23:59:59',
  })

  const [noDataMessage, setNoDataMessage] = useState<string>('')

  const filterDataByDateRange = (data: ChartData) => {
    if (!data || !dateTimeRange.startDate || !dateTimeRange.endDate) return data

    const start = new Date(`${dateTimeRange.startDate}T${dateTimeRange.startTime}`)
    const end = new Date(`${dateTimeRange.endDate}T${dateTimeRange.endTime}`)

    const filteredLabels = data.labels.filter(label => {
      const currentDate = new Date(label)
      return currentDate >= start && currentDate <= end
    })

    const filteredData = data.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.filter((_, index) => {
        const currentDate = new Date(data.labels[index])
        return currentDate >= start && currentDate <= end
      }),
    }))

    if (filteredLabels.length === 0) {
      const startStr = start.toLocaleString('vi-VN')
      const endStr = end.toLocaleString('vi-VN')
      setNoDataMessage(`Không có dữ liệu trong khoảng thời gian từ ${startStr} đến ${endStr}`)
      return data
    }

    setNoDataMessage('')
    return {
      ...data,
      labels: filteredLabels,
      datasets: filteredData,
    }
  }

  const [patients, setPatients] = useState<Patient[]>([]);
  const [showPatientList, setShowPatientList] = useState(false);

  // Lấy danh sách bệnh nhân
  const fetchPatients = async () => {
    try {
      const response = await fetch('/user.json');
      const users = await response.json();
      
      // Lọc ra những người dùng có role là patient và createdBy trùng với id người đăng nhập
      const myPatients = users.filter((user: any) => 
        user.role === 'patient' && 
        user.createdBy === session?.user?.id
      );
      
      setPatients(myPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    const checkUserAuthorization = async () => {
      try {
        const response = await fetch('/user.json');
        const users = await response.json();

        // Check if the current user exists in the user.json data
        const currentUser = users.find((user: any) => user.email === session?.user?.email);

        // If user exists, check their role
        if (currentUser) {
          setIsAuthorized(currentUser.role === 'admin' || currentUser.role === 'doctor');
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsAuthorized(false);
      }
    };

    if (session?.user) {
      checkUserAuthorization();
    }
  }, [session]);

  // Define state for authorization
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Thêm state để lưu ID bệnh nhân được chọn
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Thêm ref cho input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thêm 2 state mới
  const [patientFiles, setPatientFiles] = useState<Array<{ name: string; path: string }>>([]);
  const [showFileList, setShowFileList] = useState(false);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Main Content - Điều chỉnh width khi không có sidebar */}
        <main
          className={`${auth.isAuth ? 'col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content' : 'col-12'}`}
        >
          <div className="dashboard-content mt-4">
            {!auth.isAuth ? (
              <LoginForm />
            ) : (
              <>
                {/* File Import Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="stats-card mt-5">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center file-section">
                          <h6 className="mb-0 me-3">File .CSV / .JSON:</h6>
                          <div className="file-name-container">
                            <span className="file-name">
                              {selectedFileName || 'No file selected'}
                            </span>
                          </div>
                        </div>
                        <div className="button-wrapp">
                          <div className="file-input-wrapper">
                            <button className="btn btn-primary" onClick={handleAPIData}>
                              <i className="fas fa-cloud-download-alt me-2"></i>
                               <p>API</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Type Selection Section */}
                {hasFile && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="stats-card">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <h6 className="mb-0 me-3">Select Chart Type:</h6>
                            <select
                              className="form-select me-3"
                              value={selectedChartType}
                              onChange={e => setSelectedChartType(e.target.value)}
                              style={{ width: 'auto' }}
                            >
                              <option value="bar">Bar Chart</option>
                              <option value="line">Line Chart</option>
                              <option value="pie">Pie Chart</option>
                              <option value="doughnut">Doughnut Chart</option>
                            </select>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={handleSaveChart}
                          >
                            Display
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Section */}
                {hasFile && showChart && (
                  <div className="row">
                    <div className="col-12">
                      <div className="stats-card enhanced-stats-card">
                        <div className="enhanced-chart-wrapper">
                          {isLoading ? (
                            <div className="enhanced-loading-spinner">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <>
                              <div className="enhanced-chart-header">
                                <h5 className="enhanced-chart-title">
                                  {selectedChartType.charAt(0).toUpperCase() +
                                    selectedChartType.slice(1)}{' '}
                                  Chart
                                </h5>
                                {chartData?.metadata?.totalPoints &&
                                  chartData.metadata.totalPoints > 50 && (
                                    <span className="badge modern-alert modern-alert--info">
                                      <i className="fas fa-info-circle me-1"></i>
                                      Showing 50/{chartData.metadata.totalPoints} points
                                    </span>
                                  )}
                              </div>
                              <div className="enhanced-chart-container-inner">{renderChart()}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message when no file selected */}
                {!hasFile && (
                  <div className="row">
                    <div className="col-12">
                      <div className="chart-container d-flex align-items-center justify-content-center">
                        <p className="text-muted">Please select a CSV file to display the chart</p>
                      </div>
                    </div>
                  </div>
                )}

                {hasFile && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="stats-card">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <div className="filter-bar">
                            <div className="d-flex align-items-center">
                              <h6 className="date-start">From:</h6>
                              <input
                                type="date"
                                className="form-control me-2"
                                value={dateTimeRange.startDate}
                                onChange={e =>
                                  setDateTimeRange(prev => ({
                                    ...prev,
                                    startDate: e.target.value,
                                  }))
                                }
                              />
                              <input
                                type="time"
                                step="1"
                                className="form-control"
                                value={dateTimeRange.startTime}
                                onChange={e =>
                                  setDateTimeRange(prev => ({
                                    ...prev,
                                    startTime: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            
                            <div className="d-flex align-items-center">
                              <h6 className="date-end">To:</h6>
                              <input
                                type="date"
                                className="form-control me-2"
                                value={dateTimeRange.endDate}
                                onChange={e =>
                                  setDateTimeRange(prev => ({
                                    ...prev,
                                    endDate: e.target.value,
                                  }))
                                }
                              />
                              <input
                                type="time"
                                step="1"
                                className="form-control"
                                value={dateTimeRange.endTime}
                                onChange={e =>
                                  setDateTimeRange(prev => ({
                                    ...prev,
                                    endTime: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          
                          <div className="filter-button-wrapp d-flex gap-2">
                            <button 
                              className="btn btn-secondary"
                              onClick={() => {
                                setDateTimeRange({
                                  startDate: '',
                                  startTime: '00:00:00',
                                  endDate: '',
                                  endTime: '23:59:59',
                                })
                                setNoDataMessage('')
                                setChartData(originalChartData)
                              }}
                            >
                              Reset
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                if (chartData) {
                                  const filteredData = filterDataByDateRange(chartData)
                                  setChartData(filteredData)
                                }
                              }}
                            >
                              Apply Filter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {noDataMessage && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-warning" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {noDataMessage}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chỉ hiển thị button nếu user có quyền */}
                {isAuthorized && (
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowPatientList(!showPatientList);
                        if (!showPatientList) {
                          fetchPatients();
                        }
                      }}
                    >
                      {showPatientList ? 'Ẩn danh sách bệnh nhân' : 'Xem danh sách bệnh nhân'}
                    </button>

                    {/* Danh sách bệnh nhân */}
                    {showPatientList && (
                      <div className="mt-4">
                        <h3>Danh sách bệnh nhân của bạn</h3>
                        {patients.length > 0 ? (
                          <div className="patient-list">
                            {patients.map((patient) => (
                              <div 
                                key={patient.id} 
                                className="patient-item p-3 border rounded mb-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedPatientId(patient.id);
                                  alert(`Vui lòng chọn file từ thư mục: C:\\Users\\ducti\\NEXMIND_PATIENT\\${patient.id}`);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.click();
                                  }
                                }}
                              >
                                <h4>{patient.name}</h4>
                                <p>Email: {patient.email}</p>
                                <p>Số điện thoại: {patient.phone}</p>
                              
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>Không có bệnh nhân nào.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Thêm input file ẩn */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Sử dụng handleFileChange hiện có để xử lý file
                      handleFileChange(e);
                    }
                  }}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
