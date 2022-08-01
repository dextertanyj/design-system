import { ChangeEvent, memo, useCallback, useMemo } from 'react'
import {
  Flex,
  HStack,
  Select,
  SelectProps,
  Text,
  useBreakpointValue,
  useStyles,
} from '@chakra-ui/react'
import { addMonths } from 'date-fns/esm'
import { range } from 'lodash'

import { IconButton } from '~/IconButton'
import { BxChevronLeft } from '~/icons/BxChevronLeft'
import { BxChevronRight } from '~/icons/BxChevronRight'

import { MONTH_NAMES } from '../utils'

import { useCalendar } from './CalendarContext'

interface CalendarHeaderProps {
  monthOffset: number
}

const MonthYearSelect = ({
  children,
  ...props
}: { children: React.ReactNode } & SelectProps) => {
  return (
    <Select
      // Prevents any parent form control from applying error styles to this select.
      isInvalid={false}
      color="secondary.500"
      textStyle="subhead-1"
      flexBasis="fit-content"
      borderColor="transparent"
      cursor="pointer"
      _hover={{
        borderColor: 'transparent',
      }}
      _focus={{
        boxShadow: '0 0 0 4px var(--chakra-colors-secondary-300)',
      }}
      {...props}
    >
      {children}
    </Select>
  )
}

const SelectableMonthYear = memo(() => {
  const { currMonth, setCurrMonth, currYear, setCurrYear, startDate, endDate } =
    useCalendar()

  const yearOptions = useMemo(
    () => {
      return range(startDate.getFullYear(), endDate.getFullYear() + 1)
    }, // Include end date year
    [startDate, endDate],
  )

  const shouldUseMonthFullName = useBreakpointValue({
    base: false,
    md: true,
  })

  const memoizedMonthOptions = useMemo(() => {
    // Copy to prevent mutating original array
    const selectableMonths = [...MONTH_NAMES]
    if (currYear === yearOptions.at(0)) {
      const monthsToRemove = startDate.getMonth()
      // Remove any months before the start date.
      selectableMonths.splice(0, monthsToRemove)
    }
    if (currYear === yearOptions.at(-1)) {
      // Remove any months after the end date.
      const monthsToRemove = 11 - endDate.getMonth()
      selectableMonths.splice(monthsToRemove * -1, monthsToRemove)
    }
    return selectableMonths.map(({ shortName, fullName, index }) => (
      <option value={index} key={index}>
        {shouldUseMonthFullName ? fullName : shortName}
      </option>
    ))
  }, [shouldUseMonthFullName, currYear, startDate, endDate, yearOptions])

  const memoizedYearOptions = useMemo(() => {
    return yearOptions.map((year, index) => (
      <option value={year} key={index}>
        {year}
      </option>
    ))
  }, [yearOptions])

  const handleMonthChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setCurrMonth(parseInt(e.target.value))
    },
    [setCurrMonth],
  )
  const handleYearChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setCurrYear(parseInt(e.target.value))
    },
    [setCurrYear],
  )

  return (
    <HStack>
      <MonthYearSelect
        value={currMonth}
        onChange={handleMonthChange}
        aria-label="Change displayed month"
        // Align with dates
        pl={{ base: '0', md: '2px' }}
      >
        {memoizedMonthOptions}
      </MonthYearSelect>
      <MonthYearSelect
        value={currYear}
        onChange={handleYearChange}
        aria-label="Change displayed year"
      >
        {memoizedYearOptions}
      </MonthYearSelect>
    </HStack>
  )
})

const MonthYear = memo(({ monthOffset }: CalendarHeaderProps) => {
  const { currMonth, currYear } = useCalendar()
  const shouldUseMonthFullName = useBreakpointValue({
    base: false,
    md: true,
  })

  const newOffsetDate = useMemo(
    () => addMonths(new Date(currYear, currMonth), monthOffset),
    [currMonth, currYear, monthOffset],
  )

  const monthDisplay = useMemo(() => {
    const month = MONTH_NAMES[newOffsetDate.getMonth()]
    return shouldUseMonthFullName ? month.fullName : month.shortName
  }, [newOffsetDate, shouldUseMonthFullName])

  const yearDisplay = useMemo(() => {
    return newOffsetDate.getFullYear()
  }, [newOffsetDate])

  return (
    <HStack
      ml="1.25rem"
      textStyle="subhead-1"
      color="secondary.500"
      spacing="1.5rem"
    >
      <Text>{monthDisplay}</Text>
      <Text>{yearDisplay}</Text>
    </HStack>
  )
})

export const CalendarHeader = memo(
  ({ monthOffset }: CalendarHeaderProps): JSX.Element => {
    const styles = useStyles()
    const {
      currMonth,
      currYear,
      startDate,
      endDate,
      renderProps: { calendars, getBackProps, getForwardProps },
    } = useCalendar()

    const { disabled: _backDisabled, ...restBackProps } = getBackProps({
      calendars,
    })
    const { disabled: _forwardDisabled, ...restForwardProps } = getForwardProps(
      {
        calendars,
      },
    )

    const startYear = useMemo(() => startDate.getFullYear(), [startDate])
    const startMonth = useMemo(() => startDate.getMonth(), [startDate])
    const endYear = useMemo(() => endDate.getFullYear(), [endDate])
    const endMonth = useMemo(() => endDate.getMonth(), [endDate])

    const isBackDisabled = useMemo(
      () => currYear === startYear && currMonth === startMonth,
      [startMonth, startYear, currMonth, currYear],
    )

    const isForwardDisabled = useMemo(
      () => currYear === endYear && currMonth === endMonth,
      [endMonth, endYear, currMonth, currYear],
    )

    return (
      <Flex sx={styles.monthYearSelectorContainer}>
        {monthOffset === 0 ? (
          <SelectableMonthYear />
        ) : (
          <MonthYear monthOffset={monthOffset} />
        )}
        {calendars.length - 1 === monthOffset ? (
          <Flex sx={styles.monthArrowContainer}>
            <IconButton
              variant="clear"
              colorScheme="secondary"
              icon={<BxChevronLeft />}
              disabled={isBackDisabled}
              aria-label="Back one month"
              minW={{ base: '1.75rem', xs: '2.75rem', sm: '2.75rem' }}
              {...restBackProps}
            />
            <IconButton
              variant="clear"
              colorScheme="secondary"
              icon={<BxChevronRight />}
              disabled={isForwardDisabled}
              aria-label="Forward one month"
              minW={{ base: '1.75rem', xs: '2.75rem', sm: '2.75rem' }}
              {...restForwardProps}
            />
          </Flex>
        ) : null}
      </Flex>
    )
  },
)
