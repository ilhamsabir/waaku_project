<template>
	<div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
			<!-- Modal Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900">Create New Session</h3>
				</div>
				<button @click="handleClose" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6">
				<form @submit.prevent="handleSubmit" class="space-y-6">
					<div>
						<label for="sessionName" class="block text-sm font-medium text-gray-700 mb-2">
							Session Name <span class="text-red-500">*</span>
						</label>
						<input
							id="sessionName"
							ref="sessionNameInput"
							v-model="sessionName"
							type="text"
							placeholder="e.g., customer-support, marketing-bot, personal"
							class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-lg"
							:disabled="isLoading"
							required
							@keyup.escape="handleClose"
						/>
						<p class="mt-2 text-sm text-gray-500">
							Choose a unique name for your WhatsApp session. Use letters, numbers, and hyphens only.
						</p>
					</div>

					<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<div class="flex items-start">
							<svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<div>
								<h4 class="text-sm font-medium text-blue-900 mb-1">What happens next?</h4>
								<p class="text-sm text-blue-700">
									After creating the session, you'll need to scan a QR code with your WhatsApp mobile app to connect.
								</p>
							</div>
						</div>
					</div>

					<!-- Modal Actions -->
					<div class="flex gap-3 pt-4">
						<button
							type="button"
							@click="handleClose"
							class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
							:disabled="isLoading"
						>
							Cancel
						</button>
						<button
							type="submit"
							:disabled="!sessionName.trim() || isLoading"
							class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center space-x-2"
						>
							<svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
							</svg>
							<div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
							<span>{{ isLoading ? 'Creating...' : 'Create Session' }}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// Props
const props = defineProps({
	isVisible: {
		type: Boolean,
		default: false
	},
	isLoading: {
		type: Boolean,
		default: false
	}
})

// Emits
const emit = defineEmits(['close', 'submit'])

// Local state
const sessionName = ref('')
const sessionNameInput = ref(null)

// Watchers
watch(() => props.isVisible, async (newValue) => {
	if (newValue) {
		// Reset form when modal opens
		sessionName.value = ''
		// Focus input after modal opens
		await nextTick()
		if (sessionNameInput.value) {
			sessionNameInput.value.focus()
		}
	}
})

// Methods
function handleClose() {
	sessionName.value = ''
	emit('close')
}

function handleSubmit() {
	if (!sessionName.value.trim()) return
	emit('submit', sessionName.value.trim())
}

// Keyboard event handling
function handleKeydown(event) {
	if (event.key === 'Escape' && props.isVisible) {
		handleClose()
	}
}

// Add global escape key listener when component mounts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
	document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
	document.removeEventListener('keydown', handleKeydown)
})
</script>
