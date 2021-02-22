<template>
  <div class="project-basic content-box">
    <div style="width: 700px; margin: auto;">
      <ProjectEditForm
        ref="projectEditForm"
        :editPermission="editPermission"
        :projectId="projectId"
      />
    </div>
  </div>
</template>

<script>
import { checkPermission } from '@/utils/permissions'
import ProjectEditForm from '@/components/ProjectEditForm'

export default {
  components: {
    ProjectEditForm
  },
  data() {
    return {
      editPermission: true
    }
  },
  computed: {
    projectId() {
      return this.$store.state.app.pid
    }
  },
  mounted() {
    this.editPermission = checkPermission([50])
  }
}
</script>
