<template>
	<div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
		<!-- Auth Gate: Login Screen -->
		<div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center px-6 py-10">
			<div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
				<div class="mb-6 text-center">
					<div class="mx-auto w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
						<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.62-.01-.248 0-.654.037-.953.371-.298.334-1.037 1.016-1.037 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900">Sign in to Waaku</h2>
					<p class="text-gray-500 text-sm mt-1">Enter credentials to continue</p>
				</div>

				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
						<input v-model="loginUser" type="text" placeholder="Your username"
							class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input v-model="loginPass" type="password" placeholder="••••••••" @keyup.enter="tryLogin"
							class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200" />
					</div>
					<div v-if="authError" class="text-red-600 text-sm">{{ authError }}</div>
					<button @click="tryLogin"
						class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg">
						Sign in
					</button>
				</div>
			</div>
		</div>

		<!-- App Content -->
		<template v-else>
		<!-- Header -->
		<div class="bg-white shadow-lg border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
							<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.62-.01-.248 0-.654.037-.953.371-.298.334-1.037 1.016-1.037 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
							</svg>
						</div>
						<div>
							<h1 class="text-2xl font-bold text-gray-900">
								Waaku
							</h1>
							<p class="text-gray-600 text-sm">Manage multiple WhatsApp sessions with ease</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
					<button @click="fetchHealth" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
						</svg>
						<span>Refresh</span>
					</button>
					<button @click="logout" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors">
						Logout
					</button>
					</div>
				</div>
			</div>
		</div>

		<div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
			<!-- Dashboard Stats -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" v-if="healthData">
				<div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-200">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
								<dd class="text-2xl font-bold text-gray-900">{{ healthData.summary?.total || 0 }}</dd>
							</dl>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-200">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Ready</dt>
								<dd class="text-2xl font-bold text-gray-900">{{ healthData.summary?.ready || 0 }}</dd>
							</dl>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-200">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Healthy</dt>
								<dd class="text-2xl font-bold text-gray-900">{{ healthData.summary?.healthy || 0 }}</dd>
							</dl>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500 transform hover:scale-105 transition-all duration-200">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Unhealthy</dt>
								<dd class="text-2xl font-bold text-gray-900">{{ healthData.summary?.unhealthy || 0 }}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="flex justify-end mb-6">
				<button
					@click="openModal"
					class="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
					</svg>
					<span>Create New Session</span>
				</button>
			</div>

			<!-- Sessions List -->
			<div class="space-y-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-bold text-gray-900 flex items-center">
						<svg class="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
						</svg>
						Active Sessions ({{ sessions.length }})
					</h2>
				</div>

				<!-- Empty State -->
				<div v-if="sessions.length === 0" class="text-center py-16">
					<div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
					<p class="text-gray-500 mb-6">Create your first WhatsApp session to get started</p>
					<button
						@click="openModal"
						class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl space-x-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
						</svg>
						<span>Create Your First Session</span>
					</button>
				</div>

				<!-- Session Cards -->
				<div v-for="s in sessions" :key="s.id" class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform">
					<!-- Session Header -->
					<div class="p-6 border-b border-gray-100">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-4">
								<div class="relative">
									<div :class="getStatusBadgeClass(s)" class="w-12 h-12 rounded-full flex items-center justify-center">
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.62-.01-.248 0-.654.037-.953.371-.298.334-1.037 1.016-1.037 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
										</svg>
									</div>
									<div :class="getStatusIndicatorClass(s)" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white"></div>
								</div>
								<div>
									<h3 class="text-md font-bold text-gray-900">{{ s.id }}</h3>
									<div class="flex items-center space-x-2 mt-1">
										<span :class="getStatusTextClass(s)" class="px-3 py-1 rounded-full text-sm font-medium">
											{{ getStatusText(s) }}
										</span>
										<span v-if="s.uptime" class="text-sm text-gray-500">
											⏱️ {{ formatUptime(s.uptime) }}
										</span>
									</div>
								</div>
							</div>

							<div class="flex items-center space-x-2">
								<button @click="openQrModal(s.id)"
									class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center"
									title="Show QR Code">
									<svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
									</svg>
									Show QR
								</button>
								<button @click="checkSessionHealth(s.id)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Check Health">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								</button>
								<button @click="restartSession(s.id)" class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Restart Session">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
									</svg>
								</button>
								<button @click="deleteSession(s.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Session">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>
							</div>
						</div>
					</div>

					<!-- Message Sending Section -->
					<div v-if="false" class="p-6 bg-gradient-to-r from-green-50 to-blue-50">
						<div class="mb-4">
							<h4 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
								<svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
								</svg>
								💬 Send Message
							</h4>
							<p class="text-gray-600 text-sm">This session is ready to send messages</p>
						</div>

						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
								<div class="flex space-x-2">
									<input
										v-model="msgTo"
										placeholder="e.g., 628123456789"
										class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
									/>
									<button
										@click="validateNumber(s.id)"
										class="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors"
									>
										✅ Validate
									</button>
								</div>
								<div v-if="validationResult !== null" class="mt-2 p-3 rounded-lg" :class="validationResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
									{{ validationResult ? '✅ Phone number is valid and exists on WhatsApp' : '❌ Phone number is invalid or not found on WhatsApp' }}
								</div>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
								<textarea
									v-model="msgText"
									placeholder="Type your message here..."
									rows="4"
									class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none"
								></textarea>
							</div>

							<button
								@click="sendMessage(s.id)"
								:disabled="!msgTo.trim() || !msgText.trim()"
								class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center space-x-2"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
								</svg>
								<span>Send Message</span>
							</button>
						</div>
					</div>

					<!-- Error Display -->
					<div v-if="s.error" class="p-6 bg-red-50">
						<div class="flex items-center space-x-3">
							<div class="flex-shrink-0">
								<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
							<div class="flex-1">
								<h4 class="text-lg font-semibold text-red-800">Connection Error</h4>
								<p class="text-red-700 mt-1">{{ s.error }}</p>
								<button
									@click="restartSession(s.id)"
									class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
								>
									🔄 Try Restart
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Loading Overlay -->
		<div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
				<div class="text-center">
					<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
					<p class="text-gray-600">{{ loadingMessage || 'Please wait...' }}</p>
				</div>
			</div>
		</div>

		<!-- Toast Notifications -->
		<div v-if="notification" class="fixed top-4 right-4 z-50 transform transition-all duration-300">
			<div :class="notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'" class="text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
				<svg v-if="notification.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				<svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				<span class="font-medium">{{ notification.message }}</span>
			</div>
		</div>

		<!-- Create Session Modal -->
		<CreateSessionModal
			:is-visible="showModal"
			:is-loading="loading"
			@close="closeModal"
			@submit="handleCreateSession"
		/>

		<!-- QR Modal -->
		<div v-if="qrModal.visible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
			<div class="bg-white rounded-2xl p-6 shadow-2xl w-[90vw] max-w-md mx-4">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-gray-900">Scan QR — {{ qrModal.sessionId }}</h3>
					<button @click="closeQrModal" class="p-2 rounded-lg hover:bg-gray-100">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="flex flex-col items-center">
					<div v-if="qrLoading[qrModal.sessionId]" class="flex items-center justify-center h-72 w-72">
						<svg class="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
						</svg>
					</div>
					<div v-else-if="qr[qrModal.sessionId]" class="bg-white p-3 rounded-xl shadow border">
						<img :src="qr[qrModal.sessionId]" alt="WhatsApp QR Code" class="w-72 h-72"/>
					</div>
					<p class="mt-4 text-sm text-gray-600 text-center">
						Open WhatsApp → Settings → Linked Devices → Link a Device → Scan this QR code
					</p>
				</div>
			</div>
		</div>
		</template>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api, { getErrorMessage, isNetworkError } from './lib/api.js'
import CreateSessionModal from './components/CreateSessionModal.vue'
import { connectSocket, on as onSocket, off as offSocket } from './lib/socket.js'

// State
const sessions = ref([])
const qr = reactive({})
const qrLoading = reactive({})
const msgTo = ref('')
const msgText = ref('')
const validationResult = ref(null)
const healthData = ref(null)
const loading = ref(false)
const loadingMessage = ref('')
const notification = ref(null)
const showModal = ref(false)
const qrModal = reactive({ visible: false, sessionId: '' })

// Simple env-based UI auth (frontend-only)
const isAuthenticated = ref(false)
const loginUser = ref('')
const loginPass = ref('')
const authError = ref('')
const AUTH_USER = import.meta.env.VITE_AUTH_USER || ''
const AUTH_PASS = import.meta.env.VITE_AUTH_PASS || ''

// Helper functions
function showNotification(message, type = 'success') {
	notification.value = { message, type }
	setTimeout(() => {
		notification.value = null
	}, 4000)
}

function showLoading(message = '') {
	loading.value = true
	loadingMessage.value = message
}

function hideLoading() {
	loading.value = false
	loadingMessage.value = ''
}

function openModal() {
	showModal.value = true
}

function closeModal() {
	showModal.value = false
}

function openQrModal(id) {
	qrModal.sessionId = id
	qrModal.visible = true
	// if QR not yet fetched, trigger generation
	if (!qr[id] && !qrLoading[id]) {
		loadQr(id)
	}
}

function closeQrModal() {
	qrModal.visible = false
}

function handleCreateSession(sessionName) {
	addSession(sessionName)
}

function getStatusBadgeClass(session) {
	if (session.error) return 'bg-gradient-to-r from-red-500 to-red-600'
	if (session.ready) return 'bg-gradient-to-r from-green-500 to-green-600'
	return 'bg-gradient-to-r from-yellow-500 to-orange-500'
}

function getStatusIndicatorClass(session) {
	if (session.error) return 'bg-red-500'
	if (session.ready) return 'bg-green-500'
	return 'bg-yellow-500'
}

function getStatusTextClass(session) {
	if (session.error) return 'bg-red-100 text-red-800'
	if (session.ready) return 'bg-green-100 text-green-800'
	return 'bg-yellow-100 text-yellow-800'
}

function getStatusText(session) {
	if (session.error) return '❌ Error'
	if (session.ready) return '✅ Ready'
	return '⏳ Connecting...'
}

function formatUptime(seconds) {
	if (seconds < 60) return `${seconds}s`
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
	return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

// --- Auth helpers ---
let detachSockets = null

function initAfterAuth() {
	// Avoid duplicate listeners during hot reload/login
	if (detachSockets) {
		detachSockets()
		detachSockets = null
	}

	fetchAllData()
	// Connect socket and subscribe to real-time updates
	connectSocket()

	const updateSessions = (list) => {
		sessions.value = list
	}
	const onSessionUpdate = (list) => updateSessions(list)
	const onSessionReady = () => fetchAllData()
	const onSessionError = () => fetchAllData()
	const onQR = ({ id, qr: qrStr }) => {
		if (qrStr) qr[id] = qrStr
		// stop loader for this session once QR arrives
		if (id) qrLoading[id] = false
	}
	const onHealthUpdate = (payload) => {
		healthData.value = payload
	}

	onSocket('sessions:update', onSessionUpdate)
	onSocket('session:ready', onSessionReady)
	onSocket('session:error', onSessionError)
	onSocket('session:qr', onQR)
	onSocket('health:update', onHealthUpdate)

	detachSockets = () => {
		offSocket('sessions:update', onSessionUpdate)
		offSocket('session:ready', onSessionReady)
		offSocket('session:error', onSessionError)
		offSocket('session:qr', onQR)
		offSocket('health:update', onHealthUpdate)
	}

	if (import.meta.hot) {
		import.meta.hot.dispose(() => {
			if (detachSockets) detachSockets()
		})
	}
}

function tryLogin() {
	authError.value = ''
	if (!AUTH_USER || !AUTH_PASS) {
		authError.value = 'Auth is not configured on this build'
		return
	}
	if (loginUser.value === AUTH_USER && loginPass.value === AUTH_PASS) {
		isAuthenticated.value = true
		try { localStorage.setItem('waaku_auth', '1') } catch {}
		initAfterAuth()
	} else {
		authError.value = 'Invalid username or password'
	}
}

function logout() {
	try { localStorage.removeItem('waaku_auth') } catch {}
	isAuthenticated.value = false
	if (detachSockets) {
		detachSockets()
		detachSockets = null
	}
}

// Initialize
onMounted(() => {
    const authed = (typeof window !== 'undefined') && localStorage.getItem('waaku_auth') === '1'
    if (authed) {
        isAuthenticated.value = true
        initAfterAuth()
    }
})

// --- Data fetchers (HTTP) ---
async function fetchSessions() {
	try {
		sessions.value = await api.getSessions()
	} catch (err) {
		console.error('Failed to fetch sessions:', err)
		if (isNetworkError(err)) {
			showNotification('Network error: Please check your connection', 'error')
		}
	}
}

async function fetchHealth() {
	try {
		healthData.value = await api.getSessionsHealth()
	} catch (err) {
		console.error('Failed to fetch health:', err)
		if (isNetworkError(err)) {
			showNotification('Network error: Please check your connection', 'error')
		}
	}
}

async function addSession(sessionName) {
	if (!sessionName?.trim()) return

	showLoading('Creating new session...')
	try {
		await api.createSession(sessionName.trim())
		await fetchAllData()
		closeModal() // Close modal on success
		showNotification(`Session "${sessionName}" created successfully!`)
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to create session: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}



async function loadQr(id) {
	// guard: if already loading or QR already present, do nothing
	if (qrLoading[id] || qr[id]) return

	// set per-session loading to prevent repeated clicks
	qrLoading[id] = true
	showLoading('Generating QR code...')
	try {
		const data = await api.generateQRCode(id)
		if (data.qr) {
			qr[id] = data.qr
			qrLoading[id] = false
			showNotification('QR code generated successfully!')
		}
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to generate QR code: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
		qrLoading[id] = false
	}
}

async function validateNumber(id) {
	if (!msgTo.value.trim()) {
		showNotification('Please enter a phone number first!', 'error')
		return
	}

	showLoading('Validating phone number...')
	try {
		const data = await api.validatePhoneNumber(id, msgTo.value.trim())
		validationResult.value = data.exists
		showNotification(
			data.exists ? 'Phone number is valid!' : 'Phone number not found on WhatsApp',
			data.exists ? 'success' : 'error'
		)
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to validate number: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}

async function sendMessage(id) {
	if (!msgTo.value.trim() || !msgText.value.trim()) {
		showNotification('Please enter both phone number and message!', 'error')
		return
	}

	showLoading('Sending message...')
	try {
		const data = await api.sendMessage(id, msgTo.value.trim(), msgText.value.trim())
		if (data.success) {
			showNotification('Message sent successfully! 🚀')
			msgText.value = ''
		} else {
			showNotification(`Failed to send message: ${data.error}`, 'error')
		}
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to send message: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}

async function checkSessionHealth(id) {
	showLoading('Checking session health...')
	try {
		const health = await api.getSessionHealth(id)
		const statusText = health.healthy ? '✅ Healthy' : '❌ Unhealthy'
		showNotification(`${statusText} - ${health.status}`)
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to check health: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}

async function restartSession(id) {
	if (!confirm(`Restart session ${id}? This will disconnect the current session.`)) return

	showLoading('Restarting session...')
	try {
		const data = await api.restartSession(id)
		if (data.success) {
			showNotification('Session restarted successfully!')
			await fetchAllData()
		} else {
			showNotification(`Failed to restart: ${data.error}`, 'error')
		}
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to restart: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}

async function deleteSession(id) {
	if (!confirm(`Delete session "${id}"? This action cannot be undone.`)) return

	showLoading('Deleting session...')
	try {
		await api.deleteSession(id)
		delete qr[id]
		showNotification(`Session "${id}" deleted successfully!`)
		await fetchAllData()
	} catch (err) {
		const errorMessage = getErrorMessage(err)
		showNotification(`Failed to delete: ${errorMessage}`, 'error')
	} finally {
		hideLoading()
	}
}

// Optimized function to fetch both sessions and health data
async function fetchAllData() {
	try {
		const { sessions: sessionsData, health: healthPayload } = await api.getSessionsWithHealth()
		console.log('sessionsData: ', sessionsData);
		sessions.value = sessionsData
		healthData.value = healthPayload

	} catch (err) {
		// Fallback to individual calls if batch fails
		console.warn('Batch fetch failed, falling back to individual calls:', err)
		await fetchSessions()
		await fetchHealth()
	}
}

// (Old init removed; initialization now happens after successful login)
</script>
