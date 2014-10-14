CREATE TABLE [dbo].[Sessions](
  [PK] int IDENTITY(1,1) NOT NULL ,
  [Sid] varchar(50) NOT NULL,
  [Expires] datetimeoffset NOT NULL,
  [Sess] nvarchar(MAX) NULL,
  CONSTRAINT [PK_Sessions] PRIMARY KEY CLUSTERED ([PK] ASC)

)

go


CREATE NONCLUSTERED INDEX [GetSession] ON [dbo].[Sessions]
(
	[Sid] ASC,
	[Expires] ASC
)
INCLUDE ( 	[Sess]) WITH (FILLFACTOR = 90)

GO


CREATE TABLE [dbo].[Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[GoogleId] [nvarchar](50) NULL,
	[FacebookId] [nvarchar](50) NULL,
	[TwitterId] [nvarchar](50) NULL,
	[ProfileData] [nvarchar](max) NULL,
	[Created] [datetime2](7) NULL,
	[LastLogin] [datetime2](7) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserId] ASC)
) 

GO

CREATE NONCLUSTERED INDEX [GetUserByUserId] ON [dbo].[Users]
(
	[UserId] ASC
)
INCLUDE ( GoogleId,FacebookId,TwitterId,ProfileData,Created,LastLogin 	) WITH (FILLFACTOR = 90)

GO


CREATE NONCLUSTERED INDEX [GetUserByGoogleId] ON [dbo].[Users]
(
	GoogleId ASC
)
INCLUDE ( [UserId],FacebookId,TwitterId,ProfileData,Created,LastLogin 	) WITH (FILLFACTOR = 90)

GO
CREATE NONCLUSTERED INDEX [GetUserByFacebookId] ON [dbo].[Users]
(
	FacebookId ASC
)
INCLUDE ( GoogleId,[UserId],TwitterId,ProfileData,Created,LastLogin 	) WITH (FILLFACTOR = 90)

GO
CREATE NONCLUSTERED INDEX [GetUserByTwitterId] ON [dbo].[Users]
(
	TwitterId ASC
)
INCLUDE ( GoogleId,FacebookId,[UserId],ProfileData,Created,LastLogin 	) WITH (FILLFACTOR = 90)

GO


CREATE TABLE [mmcount].[Bags](
	[BagId] [int] IDENTITY(1,1) NOT NULL,
	[Red] [int] NOT NULL,
	[Green] [int] NOT NULL,
	[Blue] [int] NOT NULL,
	[Orange] [int] NOT NULL,
	[Brown] [int] NOT NULL,
	[Yellow] [int] NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
	[Created] [datetime2](7) NOT NULL,
	[UserId] [int] NOT NULL,
 CONSTRAINT [PK_Bags] PRIMARY KEY CLUSTERED 
(
	[BagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [mmcount].[Bags]  WITH CHECK ADD  CONSTRAINT [FK_Bags_Users1] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [mmcount].[Bags] CHECK CONSTRAINT [FK_Bags_Users1]
GO