"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, Award, BookOpen, Star, MapPin, Mail, Phone, ExternalLink, Briefcase, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface InstructorProfileProps {
  instructor: {
    name?: string
    jobRole?: string
    experienceYears?: number
    expertiseAreas?: string[]
    bio?: string
    education?: string[]
    certifications?: string[]
    rating?: number
    totalReviews?: number
    contactEmail?: string
    contactPhone?: string
    location?: string
    website?: string
    socialLinks?: {
      platform: string
      url: string
    }[]
    profileImage?: string
    achievements?: string[]
    languages?: string[]
    availability?: string
  }
}

export function InstructorProfileDialog({ instructor }: InstructorProfileProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs hover:bg-primary/10 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        View Profile
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Instructor Profile</DialogTitle>
            <DialogDescription>Detailed information about this instructor</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Header with basic info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24 border-4 border-primary/10">
                <AvatarImage src={instructor.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-purple-600 text-white">
                  {instructor.name?.[0] || "T"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <h2 className="text-2xl font-bold">{instructor.name}</h2>

                  {instructor.rating && (
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{instructor.rating.toFixed(1)}</span>
                      {instructor.totalReviews && (
                        <span className="text-sm text-muted-foreground">({instructor.totalReviews} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {instructor.jobRole && (
                    <Badge variant="outline" className="bg-primary/5">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {instructor.jobRole}
                    </Badge>
                  )}

                  {instructor.experienceYears && (
                    <Badge variant="outline" className="bg-primary/5">
                      <Clock className="h-3 w-3 mr-1" />
                      {instructor.experienceYears} years experience
                    </Badge>
                  )}

                  {instructor.location && (
                    <Badge variant="outline" className="bg-primary/5">
                      <MapPin className="h-3 w-3 mr-1" />
                      {instructor.location}
                    </Badge>
                  )}
                </div>

                {instructor.bio && <p className="text-sm text-muted-foreground mt-2">{instructor.bio}</p>}
              </div>
            </div>

            <Separator />

            {/* Expertise Areas */}
            {instructor.expertiseAreas && instructor.expertiseAreas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Areas of Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {instructor.expertiseAreas.map((area, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              {instructor.education && instructor.education.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </h3>
                    <ul className="space-y-3">
                      {instructor.education.map((edu, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {instructor.certifications && instructor.certifications.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      Certifications
                    </h3>
                    <ul className="space-y-3">
                      {instructor.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Achievements */}
            {instructor.achievements && instructor.achievements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Achievements
                </h3>
                <ul className="space-y-2">
                  {instructor.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {instructor.languages && instructor.languages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {instructor.languages.map((language, idx) => (
                    <Badge key={idx} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructor.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${instructor.contactEmail}`} className="text-sm hover:underline">
                      {instructor.contactEmail}
                    </a>
                  </div>
                )}

                {instructor.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${instructor.contactPhone}`} className="text-sm hover:underline">
                      {instructor.contactPhone}
                    </a>
                  </div>
                )}

                {instructor.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a
                      href={instructor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Personal Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {instructor.socialLinks && instructor.socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {instructor.socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <span>{social.platform}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
