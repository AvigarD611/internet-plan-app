<template>
  <div class="container mt-4">
    <!-- Header Section -->
    <div class="row mb-4 align-items-center">
      <div class="col">
        <span class="me-4">Active Plans: {{ stats.active || 0 }}</span>
        <span>Inactive Plans: {{ stats.inactive || 0 }}</span>
      </div>
      <div class="col-auto">
        <button
            class="btn btn-primary"
            @click="synchronizePlans"
            :disabled="loading"
        >
          🔄 Synchronize
          <span
              v-if="loading"
              class="spinner-border spinner-border-sm ms-2"
          ></span>
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="row mb-4">
      <div class="col-md-4">
        <select
            class="form-select"
            v-model="filters.category"
            @change="handleFilterChange"
        >
          <option value="">All Categories</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Weekly">Weekly</option>
        </select>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div
        v-if="loading"
        class="text-center my-5"
    >
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Plans Table -->
    <div v-else>
      <table class="table table-striped table-hover">
        <thead>
        <tr>
          <th>Plan Name</th>
          <th>Status</th>
          <th>Price (without MRP)</th>
          <th>MRP Amount</th>
          <th>Type</th>
          <th>Category</th>
          <th>Tags</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="plan in plans" :key="plan.id">
          <td>{{ plan.name }}</td>
          <td>
              <span
                  :class="plan.status.toLowerCase() === 'active' ? 'text-success' : 'text-danger'"
              >
                {{ plan.status }}
              </span>
          </td>
          <td>₹{{ parseFloat(plan.price).toFixed(2) }}</td>
          <td>₹{{ calculateMRP(parseFloat(plan.price)).toFixed(2) }}</td>
          <td>{{ plan.type }}</td>
          <td>{{ plan.category }}</td>
          <td>
              <span
                  v-for="tag in plan.tags"
                  :key="tag"
                  class="badge bg-secondary me-1"
              >
                {{ tag }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <nav v-if="pagination.total_pages > 1">
        <ul class="pagination justify-content-center">
          <li
              class="page-item"
              :class="{ disabled: pagination.current_page === 1 }"
          >
            <a
                class="page-link"
                href="#"
                @click.prevent="changePage(pagination.current_page - 1)"
            >
              Previous
            </a>
          </li>
          <li
              v-for="page in pagination.total_pages"
              :key="page"
              class="page-item"
              :class="{ active: pagination.current_page === page }"
          >
            <a
                class="page-link"
                href="#"
                @click.prevent="changePage(page)"
            >
              {{ page }}
            </a>
          </li>
          <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.total_pages }"
          >
            <a
                class="page-link"
                href="#"
                @click.prevent="changePage(pagination.current_page + 1)"
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import api from './services/api';

export default {
  name: 'App',
  data() {
    return {
      plans: [],
      loading: false,
      stats: {
        active: 0,
        inactive: 0
      },
      filters: {
        category: '',
        page: 1,
        per_page: 10
      },
      pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        total_pages: 0
      }
    };
  },
  methods: {
    async fetchStats() {
      try {
        const response = await api.get('/api/internet-plans/stats');
        this.stats = response.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        alert('Failed to fetch plan statistics. Please try again.');
      }
    },
    async fetchPlans() {
      try {
        this.loading = true;

        const params = {
          page: this.filters.page,
          per_page: this.filters.per_page
        };

        if (this.filters.category) {
          params.category = this.filters.category;
        }

        const response = await api.post('/api/internet-plans', params);
        this.plans = response.data.data;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Error fetching plans:', error);
        alert('Failed to fetch plans. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    async synchronizePlans() {
      try {
        this.loading = true;
        await api.get('/api/internet-plans/sync');
        await Promise.all([
          this.fetchPlans(),
          this.fetchStats()
        ]);
      } catch (error) {
        console.error('Error synchronizing plans:', error);
        alert('Failed to synchronize plans. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.pagination.total_pages) {
        this.filters.page = page;
        await this.fetchPlans();
      }
    },
    calculateMRP(price) {
      return price * 0.18;
    },
    handleFilterChange() {
      this.filters.page = 1; // Reset to first page when filters change
      this.fetchPlans();
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchPlans(),
      this.fetchStats()
    ]);
  }
};
</script>

<style>
.pagination {
  margin-top: 2rem;
}
</style>