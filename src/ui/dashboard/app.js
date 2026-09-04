/**
 * TRAVEL AGENT UI - APPLICATION LOGIC
 * 
 * Handles:
 * - Tool selection & form switching
 * - API calls
 * - Result display
 * - Observability metrics
 * - Execution logs
 */

const app = {
  state: {
    currentTool: 'weather',
    logs: [],
    metrics: {
      apiCalls: 0,
      totalTime: 0,
      times: []
    }
  },

  // ============================================
  // INITIALIZATION
  // ============================================

  init() {
    this.setupToolButtons();
    this.setupForms();
    this.log('✅ Application initialized', 'success');
  },

  // ============================================
  // TOOL BUTTON HANDLING
  // ============================================

  setupToolButtons() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        this.switchTool(tool);
      });
    });
  },

  switchTool(tool) {
    // Update state
    this.state.currentTool = tool;

    // Update button styles
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');

    // Update form visibility
    document.querySelectorAll('.tool-form').forEach(form => {
      form.classList.remove('show');
    });
    document.getElementById(`${tool}-form`).classList.add('show');

    this.log(`📍 Switched to ${tool} tool`, 'info');
  },

  // ============================================
  // FORM HANDLING
  // ============================================

  setupForms() {
    // Weather Form
    document.getElementById('weather-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const city = e.target.querySelector('input').value.trim();
      this.callTool('weather', { city });
      e.target.reset();
    });

    // Flights Form
    document.getElementById('flights-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = e.target.querySelectorAll('input');
      const origin = inputs[0].value.trim().toUpperCase();
      const destination = inputs[1].value.trim().toUpperCase();
      const departureDate = inputs[2].value;
      this.callTool('flights', { origin, destination, departureDate });
      e.target.reset();
    });

    // Attractions Form
    document.getElementById('attractions-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const city = e.target.querySelector('input').value.trim();
      this.callTool('attractions', { city });
      e.target.reset();
    });

    // Costs Form
    document.getElementById('costs-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const city = e.target.querySelector('input').value.trim();
      this.callTool('costs', { city });
      e.target.reset();
    });

    // Safety Form
    document.getElementById('safety-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const city = e.target.querySelector('input').value.trim();
      this.callTool('safety', { city });
      e.target.reset();
    });
  },

  // ============================================
  // API CALLS
  // ============================================

  async callTool(tool, params) {
    const startTime = Date.now();
    this.log(`🔄 Calling ${tool}...`, 'info');

    // Show loading
    document.getElementById('results').innerHTML = '<p class="placeholder">⏳ Loading...</p>';

    try {
      const response = await fetch(`/api/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      // Update metrics
      this.state.metrics.apiCalls++;
      this.state.metrics.totalTime += duration;
      this.state.metrics.times.push(duration);
      this.updateMetrics();

      if (data.success) {
        this.displayResult(tool, data);
        this.log(`✅ Complete in ${duration}ms`, 'success');
      } else {
        this.displayError(data.error);
        this.log(`❌ Error: ${data.error}`, 'error');
      }
    } catch (error) {
      this.log(`❌ Network Error: ${error.message}`, 'error');
      this.displayError(error.message);
    }
  },

  // ============================================
  // RESULT DISPLAY
  // ============================================

  displayResult(tool, data) {
    const resultsDiv = document.getElementById('results');

    switch (tool) {
      case 'weather':
        this.displayWeather(resultsDiv, data);
        break;
      case 'flights':
        this.displayFlights(resultsDiv, data);
        break;
      case 'attractions':
        this.displayAttractions(resultsDiv, data);
        break;
      case 'costs':
        this.displayCosts(resultsDiv, data);
        break;
      case 'safety':
        this.displaySafety(resultsDiv, data);
        break;
    }
  },

  displayWeather(div, data) {
    div.innerHTML = `
      <div class="result-card">
        <h4>🌤️ ${data.city}, ${data.country}</h4>
        <div class="result-item"><span>Temperature</span><strong>${data.temperature}°C</strong></div>
        <div class="result-item"><span>Condition</span><strong>${data.condition}</strong></div>
        <div class="result-item"><span>Humidity</span><strong>${data.humidity}%</strong></div>
        <div class="result-item"><span>Wind Speed</span><strong>${data.windSpeed} km/h</strong></div>
        <div class="result-item"><span>Apparent Temp</span><strong>${data.apparentTemperature}°C</strong></div>
      </div>
    `;
  },

  displayFlights(div, data) {
    let html = `
      <div class="result-card">
        <h4>✈️ ${data.originCode} → ${data.destCode}</h4>
        <div class="result-item"><span>Date</span><strong>${data.departureDate}</strong></div>
        <div class="result-item"><span>Distance</span><strong>${data.distance} km</strong></div>
        <div class="result-item"><span>Cheapest Price</span><strong>$${data.cheapestPrice}</strong></div>
      </div>
    `;

    data.flights.forEach((flight, i) => {
      html += `
        <div class="result-card">
          <h4>${i + 1}. ${flight.airline}</h4>
          <div class="result-item"><span>Price</span><strong>$${flight.price}</strong></div>
          <div class="result-item"><span>Duration</span><strong>${flight.duration}</strong></div>
          <div class="result-item"><span>Stops</span><strong>${flight.stops}</strong></div>
          <div class="result-item"><span>Rating</span><strong>⭐ ${flight.rating}</strong></div>
        </div>
      `;
    });

    div.innerHTML = html;
  },

  displayAttractions(div, data) {
    let html = `
      <div class="result-card">
        <h4>🏛️ Attractions in ${data.city}</h4>
        <div class="result-item"><span>Total Found</span><strong>${data.count}</strong></div>
      </div>
    `;

    data.attractions.forEach((attraction, i) => {
      html += `
        <div class="result-card">
          <h4>${i + 1}. ${attraction.name}</h4>
          <div class="result-item"><span>Category</span><strong>${attraction.category}</strong></div>
          <div class="result-item"><span>Rating</span><strong>⭐ ${attraction.rating}</strong></div>
          <div class="result-item"><span>Visitors/Year</span><strong>${attraction.visitorsPerYear}</strong></div>
          <div style="padding: 10px 0; color: #666; font-size: 0.85rem; border-top: 1px solid #e0e7ff; margin-top: 8px;">
            ${attraction.description}
          </div>
        </div>
      `;
    });

    div.innerHTML = html;
  },

  displayCosts(div, data) {
    div.innerHTML = `
      <div class="result-card">
        <h4>💰 ${data.city}, ${data.country}</h4>
        <div class="result-item"><span>Average Meal</span><strong>$${data.costs.mealAveragUSD}</strong></div>
        <div class="result-item"><span>Transport Trip</span><strong>$${data.costs.transportPerTripUSD}</strong></div>
        <div class="result-item"><span>Accommodation/Night</span><strong>$${data.costs.accommodationPerNightUSD}</strong></div>
        <div class="result-item"><span>Coffee</span><strong>$${data.costs.coffeeUSD}</strong></div>
      </div>
      <div class="result-card">
        <h4>💵 Estimated Daily Budget</h4>
        <div style="font-size: 1.8rem; color: #667eea; font-weight: 700; text-align: center;">
          $${data.costs.estimatedDailyBudgetUSD}
        </div>
      </div>
    `;
  },

  displaySafety(div, data) {
    const levelColor = data.safetyIndex >= 80 ? '#10b981' :
                       data.safetyIndex >= 70 ? '#667eea' :
                       data.safetyIndex >= 60 ? '#f59e0b' : '#ef4444';

    div.innerHTML = `
      <div class="result-card">
        <h4>🛡️ ${data.city}, ${data.country}</h4>
        <div class="result-item"><span>Safety Index</span><strong>${data.safetyIndex}/100</strong></div>
        <div class="result-item"><span>Crime Index</span><strong>${data.crimeIndex}/100</strong></div>
        <div class="result-item"><span>Safety Level</span><strong style="color: ${levelColor};">${data.safetyLevel}</strong></div>
      </div>
      <div class="result-card">
        <h4>📋 Recommendation</h4>
        <div style="color: #666; font-size: 0.9rem; line-height: 1.6;">
          ${data.recommendation}
        </div>
      </div>
    `;
  },

  displayError(error) {
    document.getElementById('results').innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: #ef4444;">
        <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Error</div>
        <div>${error}</div>
      </div>
    `;
  },

  // ============================================
  // OBSERVABILITY METRICS
  // ============================================

  updateMetrics() {
    document.getElementById('api-calls').textContent = this.state.metrics.apiCalls;
    document.getElementById('total-time').textContent = this.state.metrics.totalTime + 'ms';

    const avg = this.state.metrics.times.length > 0
      ? Math.round(this.state.metrics.totalTime / this.state.metrics.times.length)
      : 0;
    document.getElementById('avg-time').textContent = avg + 'ms';
  },

  // ============================================
  // LOGGING
  // ============================================

  log(message, level = 'info') {
    const time = new Date().toLocaleTimeString();
    this.state.logs.unshift({ message, level, time });

    // Keep only last 100 logs
    if (this.state.logs.length > 100) {
      this.state.logs = this.state.logs.slice(0, 100);
    }

    this.renderLogs();
  },

  renderLogs() {
    const logsDiv = document.getElementById('logs');
    logsDiv.innerHTML = this.state.logs
      .map(log => `<div class="log-entry ${log.level}">[${log.time}] ${log.message}</div>`)
      .join('');
    logsDiv.scrollTop = logsDiv.scrollHeight;
  }
};

// ============================================
// START APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});