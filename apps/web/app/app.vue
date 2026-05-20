<script setup lang="ts"></script>

<template>
	<NuxtAnnouncer />
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator />
	<UApp>
		<NuxtLayout>
			<NuxtErrorBoundary>
				<NuxtPage />
				<template #error="{ error }">
					<UContainer class="py-20 text-center">
						<Icon name="lucide:alert-triangle" class="mx-auto mb-4 size-12 text-amber-500" />
						<p class="mb-2 text-lg font-medium text-neutral-700 dark:text-neutral-300">
							Something went wrong
						</p>
						<p class="mb-6 text-sm text-neutral-500">
							An unexpected error occurred. Please try again.
						</p>
						<UButton @click="error.value = null">
							Try Again
						</UButton>
					</UContainer>
				</template>
			</NuxtErrorBoundary>
		</NuxtLayout>
	</UApp>
</template>
