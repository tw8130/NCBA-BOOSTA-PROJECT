// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 7: Business Profile (65/35 Layout)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, MapPin, Users, Calendar, Briefcase } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'

const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kiambu',
  'Nakuru',
  'Machakos',
  'Kisumu',
  'Uasin Gishu',
  'Kajiado',
  'Kilifi',
  'Nyeri',
  'Meru',
  'Kakamega',
  'Bungoma',
  'Kisii',
  'Murang\'a',
  'Kericho',
  'Embu',
  'Kitui',
  'Makueni',
  'Laikipia',
  'Trans Nzoia',
  'Bomet',
  'Homa Bay',
  'Migori',
  'Siaya',
  'Busia',
  'Nandi',
  'Baringo',
  'Narok',
  'Kwale',
  'Taita Taveta',
  'Garissa',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Isiolo',
  'Kirinyaga',
  'Nyandarua',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Elgeyo Marakwet',
  'Tharaka Nithi',
  'Vihiga',
  'Nyamira',
  'Tana River',
  'Lamu',
]

const SECTOR_OPTIONS = [
  { value: 'Fast Moving Consumer Goods (FMCG)', label: 'Fast Moving Consumer Goods (FMCG)' },
  { value: 'Beverages & Soft Drinks', label: 'Beverages & Soft Drinks' },
  { value: 'Alcoholic Beverages & Brewing', label: 'Alcoholic Beverages & Brewing' },
  { value: 'Hardware, Steel & Construction', label: 'Hardware, Steel & Construction' },
  { value: 'Footwear, Leather & Apparel', label: 'Footwear, Leather & Apparel' },
  { value: 'Agro-Chemicals & Animal Feeds', label: 'Agro-Chemicals & Animal Feeds' },
  { value: 'Pharmaceuticals & Health Supplies', label: 'Pharmaceuticals & Health Supplies' },
  { value: 'General Merchandise & Retail', label: 'General Merchandise & Retail' },
]

export default function BusinessProfile() {
  const navigate = useNavigate()
  const { state, updateBusinessProfile } = useOnboarding()

  const [businessName, setBusinessName] = useState(state.businessName || 'Kiami General Supplies Ltd')
  const [tradingName, setTradingName] = useState(state.tradingName || 'Kiami Wholesale & Distribution')
  const [regNumber, setRegNumber] = useState(state.registrationNumber || 'BN/2018/89412')
  const [sector, setSector] = useState(state.sector || 'Fast Moving Consumer Goods (FMCG)')
  const [employees, setEmployees] = useState(state.employees || 14)
  const [dateStarted, setDateStarted] = useState(state.dateStarted || '2018-06-12')
  const [county, setCounty] = useState(state.county || 'Nairobi')
  const [subCounty, setSubCounty] = useState(state.subCounty || 'Embakasi North')

  function handleSaveAndContinue() {
    updateBusinessProfile({
      businessName,
      tradingName,
      registrationNumber: regNumber,
      sector,
      employees: Number(employees),
      dateStarted,
      county,
      subCounty,
    })
    navigate('/customer/premises')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Commercial Business Profile
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Tell us about your distribution enterprise, trading sectors, and commercial footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Registered Business Legal Name */}
          <div className="sm:col-span-2">
            <Input
              label="Registered Business Legal Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              prefixAddon={<Building2 size={15} />}
              placeholder="e.g. Kiami General Supplies Ltd"
              helperText="Must match Business Registration Certificate / CR12."
            />
          </div>

          {/* Trading / DBA Name */}
          <div>
            <Input
              label="Trading / Outlet Name (DBA)"
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
              placeholder="e.g. Kiami Wholesale"
              helperText="Signage or trade outlet name."
            />
          </div>

          {/* Registration / BN Number */}
          <div>
            <Input
              label="Business Registration Number (BN/PVT)"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. BN/2018/89412 or CPR/2021/10492"
            />
          </div>

          {/* Sector */}
          <div className="sm:col-span-2">
            <Select
              label="Primary Business Sector / Anchor Channel"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              options={SECTOR_OPTIONS}
            />
          </div>

          {/* Number of Employees */}
          <div>
            <Input
              label="Active Staff / Employee Count"
              type="number"
              min={1}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              prefixAddon={<Users size={15} />}
            />
          </div>

          {/* Date Started Operations */}
          <div>
            <Input
              label="Date Commenced Operations"
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
              prefixAddon={<Calendar size={15} />}
            />
          </div>

          {/* County (47 Kenyan Counties) */}
          <div>
            <Select
              label="Operating County (Kenya)"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              options={KENYAN_COUNTIES.map((c) => ({ value: c, label: `${c} County` }))}
            />
          </div>

          {/* Sub-County / Physical Location */}
          <div>
            <Input
              label="Sub-County & Commercial Street"
              value={subCounty}
              onChange={(e) => setSubCounty(e.target.value)}
              prefixAddon={<MapPin size={15} />}
              placeholder="e.g. Embakasi North, Kangundo Rd"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            onClick={handleSaveAndContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            Continue to Premises Geotag Verification
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={7}
        totalSteps={12}
        stepTitle="Business Profile"
        backPath="/customer/kyc"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 7: Commercial Business Profile"
          subtitle="Enterprise details, trading history, and physical operating location"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="business" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
