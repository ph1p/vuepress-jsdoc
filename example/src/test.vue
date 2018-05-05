<template>
  <div class="navigation">

  </div>
</template>

<script>
import EndNavigationModal from './EndNavigationModal';
import { Carousel, Slide } from 'vue-carousel';

/**
 * @vue
 */
export default {
  components: {
    EndNavigationModal,
    Carousel,
    Slide
  },
  data() {
    return {
      isNavigationLocked: false
    };
  },
  computed: {
    isNavigationVisible() {
      return this.$store.getters.isNavigationVisible;
    },
    isEndNavigationModalVisible() {
      return this.$store.getters.isEndNavigationModalVisible;
    },
    activeSection() {
      return this.$store.getters.activeSection;
    },
    activeSubSection() {
      return this.$store.getters.activeSubSection;
    },
    sections() {
      return this.$sections;
    },
    sectionsWithoutProfiSubviews() {
      return this.$sectionsWithoutProfiSubviews;
    }
  },
  methods: {
    formatSubViewNumber(index) {
      return index < 9 ? `0${index + 1}` : index + 1;
    },
    calcProgressbarWidth() {
      const activeSectionWidth = this.sectionsWithoutProfiSubviews[this.activeSection].subviews.length;
      let barWidth = 18;
      if (activeSectionWidth < 10) {
        barWidth = 40;
      } else if (activeSectionWidth < 15) {
        barWidth = 30;
      }
      return barWidth;
    },
    resetActiveSubsection() {
      this.$store.dispatch(
        'setActiveSubSection',
        this.sectionsWithoutProfiSubviews[this.activeSection].subviews[0].meta.index
      );
    },
    resetNavigation() {
      this.toggleCloseNavigationModal();
      this.toggleNav();
      this.$router.push({
        path: '/'
      });
    },
    toggleNav() {
      if (!this.isNavigationLocked) {
        this.$store.dispatch('toggleIsNavigationVisible');
      }
    },
    toggleCloseNavigationModal() {
      if (!this.isNavigationLocked) {
        this.$store.dispatch('toggleIsEndNavigationModalVisible');
      }
    },
    /**
     * @param {Number} index Number of the section to display
     */
    setActiveSection(index) {
      this.$store.dispatch('setActiveSection', index);
      this.$store.dispatch('setActiveSubSection', 0);
    },
    /**
     * @param {Number} index Number of the subsection to display
     */
    setActiveSubSection(index) {
      this.$store.dispatch('setActiveSubSection', index);
    },
    /**
     * Navigate to the next subsection
     */
    nextSubsection() {
      if (!this.isNavigationLocked) {
        if (this.activeSubSection < this.$sections[this.activeSection].subviews.length - 1) {
          this.$store.dispatch('setActiveSubSection', this.activeSubSection + 1);
          this.$router.push({
            path: `/${this.sections[this.activeSection].path}/${
              this.sections[this.activeSection].subviews[this.activeSubSection].path
            }`
          });
        } else {
          this.$router.push({
            path: '/pyramid'
          });
        }
      }
    },
    /**
     * Navigate to the prevoius subsection
     */
    previousSubsection() {
      if (!this.isNavigationLocked) {
        if (this.activeSubSection > 0) {
          this.$store.dispatch('setActiveSubSection', this.activeSubSection - 1);
          this.$router.push({
            path: `/${this.sections[this.activeSection].path}/${
              this.sections[this.activeSection].subviews[this.activeSubSection].path
            }`
          });
        }
      }
    }
  },
  created() {
    this.$root.$on('toggle-paintable-screen', isPainterActive => {
      this.isNavigationLocked = isPainterActive;
    });
  }
};
</script>

<style lang="scss" scoped>
</style>
