<template>
    <div>
        <v-card outlined>
            <v-card-text class="pa-0">
                <v-simple-table>
                    <thead class="accent">
                        <tr>
                            <th>Features</th>
                            <th class="text-center">FREE</th>
                            <th class="text-center">PRO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Automations</td>
                            <td class="text-center">{{ $store.state.freePlanDetails.maxRecipes }}</td>
                            <td class="text-center">Unlimited</td>
                        </tr>
                        <tr>
                            <td>Conditions</td>
                            <td class="text-center">{{ $store.state.freePlanDetails.maxConditions }}</td>
                            <td class="text-center">Unlimited</td>
                        </tr>
                        <tr>
                            <td>GearWear</td>
                            <td class="text-center">{{ $store.state.freePlanDetails.maxGearWear }}</td>
                            <td class="text-center">Unlimited</td>
                        </tr>
                        <tr>
                            <td>Weather Providers</td>
                            <td class="text-center">1</td>
                            <td class="text-center">5</td>
                        </tr>
                        <tr>
                            <td>No Linkbacks</td>
                            <td class="text-center"><v-icon>mdi-checkbox-blank-circle-outline</v-icon></td>
                            <td class="text-center"><v-icon>mdi-checkbox-marked-circle-outline</v-icon></td>
                        </tr>
                        <tr>
                            <td>Webhooks</td>
                            <td class="text-center"><v-icon>mdi-checkbox-blank-circle-outline</v-icon></td>
                            <td class="text-center"><v-icon>mdi-checkbox-marked-circle-outline</v-icon></td>
                        </tr>
                        <tr>
                            <td>Price</td>
                            <td class="text-center">Free</td>
                            <td class="text-center">
                                <n-link to="/billing" v-if="!$store.state.user.isPro" nuxt>${{ $store.state.proPlanDetails.price.year }} / year</n-link>
                                <span v-else>${{ $store.state.proPlanDetails.price.year }} / year</span>
                            </td>
                        </tr>
                    </tbody>
                </v-simple-table>
            </v-card-text>
        </v-card>
        <ul class="caption mt-2 mb-5 pl-4" v-if="!$store.state.user || !$store.state.user.isPro">
            <li>Free accounts are limited to {{ $store.state.freePlanDetails.maxConditions }} conditions per automation.</li>
            <li>Free accounts are limited to {{ $store.state.freePlanDetails.maxGearWear }} GearWear configurations.</li>
            <li>Free accounts will have a link to Strautomator added to around {{ $store.state.linksOnPercent }}% of processed activities by default.</li>
        </ul>
    </div>
</template>
