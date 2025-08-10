// Chart.js configuration and management
import { appState } from './state.js';

let hourlyChart = null;

// Chart.js default configuration
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index'
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 12
            }
        }
    },
    scales: {
        x: {
            display: true,
            grid: {
                display: false
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                    size: 11
                }
            }
        },
        y: {
            display: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                    size: 11
                }
            }
        }
    }
};

// Initialize or update hourly temperature chart
export function updateHourlyChart(weather) {
    const canvas = document.getElementById('hourly-chart');
    if (!canvas || !weather?.hourly) return;
    
    const ctx = canvas.getContext('2d');
    const hourly = weather.hourly;
    
    // Prepare data for next 24 hours
    const now = new Date();
    const labels = [];
    const temperatures = [];
    const precipitationProbability = [];
    
    for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
        const time = new Date(hourly.time[i]);
        
        // Skip past hours
        if (time <= now) continue;
        
        labels.push(dayjs(time).format(appState.get().settings.timeFormat === '12' ? 'h A' : 'HH:mm'));
        temperatures.push(hourly.temperature_2m[i]);
        precipitationProbability.push(hourly.precipitation_probability[i] || 0);
        
        // Stop at 24 hours
        if (labels.length >= 24) break;
    }
    
    // Destroy existing chart
    if (hourlyChart) {
        hourlyChart.destroy();
    }
    
    // Create new chart
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature',
                    data: temperatures.map(temp => appState.get().settings.temperatureUnit === 'fahrenheit' ? (temp * 9/5) + 32 : temp),
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366F1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Precipitation',
                    data: precipitationProbability,
                    borderColor: '#06B6D4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#06B6D4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: `Temperature (${appState.get().settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C'})`,
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Precipitation (%)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        }
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label}`;
                        },
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y;
                            
                            if (datasetLabel === 'Temperature') {
                                const unit = appState.get().settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
                                return `Temperature: ${Math.round(value)}${unit}`;
                            } else if (datasetLabel === 'Precipitation') {
                                return `Precipitation: ${Math.round(value)}%`;
                            }
                            
                            return `${datasetLabel}: ${value}`;
                        }
                    }
                }
            }
        }
    });
}

// Update chart colors for theme changes
export function updateChartTheme(isDark) {
    if (!hourlyChart) return;
    
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // Update chart options
    hourlyChart.options.scales.x.ticks.color = textColor;
    hourlyChart.options.scales.y.ticks.color = textColor;
    hourlyChart.options.scales.y.title.color = textColor;
    
    if (hourlyChart.options.scales.y1) {
        hourlyChart.options.scales.y1.ticks.color = textColor;
        hourlyChart.options.scales.y1.title.color = textColor;
    }
    
    hourlyChart.options.scales.x.grid.color = gridColor;
    hourlyChart.options.scales.y.grid.color = gridColor;
    
    // Update chart
    hourlyChart.update('none');
}

// Destroy chart when not needed
export function destroyCharts() {
    if (hourlyChart) {
        hourlyChart.destroy();
        hourlyChart = null;
    }
}

// Resize charts when container size changes
export function resizeCharts() {
    if (hourlyChart) {
        hourlyChart.resize();
    }
}

// Export chart instances for external access
export function getChartInstances() {
    return {
        hourlyChart
    };
}